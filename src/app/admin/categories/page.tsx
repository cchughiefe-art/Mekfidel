"use client";
import type { DatabaseRow } from "@/types/database";
import { saveAdminRecord, deleteAdminRecord } from "@/lib/utils/admin-actions";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DatabaseRow<"categories"> | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error: queryError1 } = await supabase
        .from("categories")
        .select("*")
        .order("order");
      if (queryError1) throw queryError1;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await saveAdminRecord("categories", { name, description }, editing.id);
      } else {
        const slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-");
        await saveAdminRecord("categories", { name, slug, description });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowModal(false);
      setEditing(null);
      setName("");
      setDescription("");
      toast.success(editing ? "Category updated" : "Category created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteAdminRecord("categories", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Category deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const openEdit = (cat: DatabaseRow<"categories">) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage product categories</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Slug
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20">
                  <Spinner />
                </td>
              </tr>
            ) : (
              categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cat.is_active ? "success" : "warning"}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(cat)}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm("Delete this category?"))
                            deleteMutation.mutate(cat.id);
                        }}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
