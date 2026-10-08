"use client";
import { notifyContentChange } from "@/lib/utils/content-sync";
import { ListPagination } from "@/components/ui/list-pagination";
import type { DatabaseRow } from "@/types/database";
import { saveAdminRecord, deleteAdminRecord } from "@/lib/utils/admin-actions";
import Papa from "papaparse";
import { compatibilitySchema } from "@/lib/utils/validators";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCompatibilityPage() {
  const supabase = createClient();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] =
    useState<DatabaseRow<"screen_compatibility"> | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    series: "",
    screen_code: "",
    manufacturer_model: "",
    compatible_with: "",
    notes: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-compatibility", page],
    queryFn: async () => {
      const { data, error: queryError1 } = await supabase
        .from("screen_compatibility")
        .select("*")
        .order("brand")
        .order("model")
        .order("id")
        .range((page - 1) * 20, page * 20 - 1);
      if (queryError1) throw queryError1;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const compatible_with = formData.compatible_with
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { ...formData, compatible_with };

      if (editing) {
        await saveAdminRecord("screen_compatibility", payload, editing.id);
      } else {
        await saveAdminRecord("screen_compatibility", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowModal(false);
      setEditing(null);
      toast.success(editing ? "Updated" : "Created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteAdminRecord("screen_compatibility", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("CSV must be smaller than 2 MB");
      const parsed = Papa.parse<Record<string, string>>(await file.text(), {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => header.trim(),
      });
      if (parsed.errors.length)
        throw new Error(
          `CSV row ${parsed.errors[0].row ?? 0}: ${parsed.errors[0].message}`,
        );
      if (parsed.data.length > 1000)
        throw new Error("Import up to 1,000 records at once");
      const rows = parsed.data.map((row, index) => {
        const result = compatibilitySchema.safeParse({
          ...row,
          compatible_with: row.compatible_with
            ? row.compatible_with.split(";").map((value) => value.trim())
            : [],
        });
        if (!result.success)
          throw new Error(
            `Row ${index + 2}: ${result.error.issues[0].message}`,
          );
        return { ...result.data, is_active: true };
      });
      if (!rows.length) throw new Error("CSV contains no records");
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          rows.map((row) => ({
            resource: "screen_compatibility",
            operation: "create",
            targetLabel: row.brand + " " + row.model,
            changes: row,
          })),
        ),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");
      notifyContentChange();
      await queryClient.invalidateQueries();
      toast.success(`Imported ${rows.length} records`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
    e.target.value = "";
  };

  const handleCSVExport = async () => {
    const exportRows: typeof items = [];
    try {
      for (let offset = 0; offset < 10000; offset += 500) {
        const { data, error } = await supabase
          .from("screen_compatibility")
          .select("*")
          .order("id")
          .range(offset, offset + 499);
        if (error) throw error;
        exportRows.push(...data);
        if (data.length < 500) break;
        if (offset === 9500)
          throw new Error("Export up to 10,000 records at once");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not export records",
      );
      return;
    }
    const fields = [
      "brand",
      "model",
      "series",
      "screen_code",
      "manufacturer_model",
      "compatible_with",
      "notes",
    ];
    const csv = Papa.unparse(
      {
        fields,
        data: exportRows.map((item) =>
          fields.map((field) =>
            field === "compatible_with"
              ? (item[field] || []).join(";")
              : item[field] || "",
          ),
        ),
      },
      { escapeFormulae: true },
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screen-compatibility.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleBulkDelete = async () => {
    if (!items?.length) return;
    if (
      !confirm(
        `Delete these ${items.length} compatibility records? You can undo this change from the AI assistant history.`,
      )
    )
      return;
    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          items.map((item) => ({
            resource: "screen_compatibility",
            operation: "delete",
            targetId: item.id,
            targetLabel: item.model,
            changes: {},
          })),
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not delete records");
      notifyContentChange();
      await queryClient.invalidateQueries();
      toast.success("Records deleted. Undo is available in change history.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete records",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Phone Screen Compatibility
          </h1>
          <p className="text-gray-500 mt-1">Manage compatibility database</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="btn-outline text-sm cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
          </label>
          <Button variant="ghost" size="sm" onClick={handleCSVExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setFormData({
                brand: "",
                model: "",
                series: "",
                screen_code: "",
                manufacturer_model: "",
                compatible_with: "",
                notes: "",
              });
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
          Delete this page
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Brand
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Model
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Series
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Screen Code
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Manuf. Model
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Compatible With
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-20">
                  <Spinner />
                </td>
              </tr>
            ) : (
              items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.brand}</td>
                  <td className="px-6 py-4">{item.model}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.series || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                    {item.screen_code || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                    {item.manufacturer_model || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.compatible_with || [])
                        .slice(0, 3)
                        .map((c: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      {(item.compatible_with?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400">
                          +{item.compatible_with.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(item);
                          setFormData({
                            brand: item.brand,
                            model: item.model,
                            series: item.series || "",
                            screen_code: item.screen_code || "",
                            manufacturer_model: item.manufacturer_model || "",
                            compatible_with: (item.compatible_with || []).join(
                              ", ",
                            ),
                            notes: item.notes || "",
                          });
                          setShowModal(true);
                        }}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteMutation.mutate(item.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ListPagination
        page={page}
        onPage={setPage}
        hasNext={(items?.length || 0) === 20}
        loading={isLoading}
      />
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Record" : "Add Record"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
            <Input
              label="Model"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Series"
              value={formData.series}
              onChange={(e) =>
                setFormData({ ...formData, series: e.target.value })
              }
            />
            <Input
              label="Screen Code"
              value={formData.screen_code}
              onChange={(e) =>
                setFormData({ ...formData, screen_code: e.target.value })
              }
            />
          </div>
          <Input
            label="Manufacturer Model"
            value={formData.manufacturer_model}
            onChange={(e) =>
              setFormData({ ...formData, manufacturer_model: e.target.value })
            }
          />
          <Input
            label="Compatible With (comma separated)"
            value={formData.compatible_with}
            onChange={(e) =>
              setFormData({ ...formData, compatible_with: e.target.value })
            }
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
            >
              {editing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
