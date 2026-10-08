"use client";
import { ListPagination } from "@/components/ui/list-pagination";
import { searchTerm } from "@/lib/utils/safe-content";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveAdminRecord } from "@/lib/utils/admin-actions";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";
import { useState } from "react";

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const [editing, setEditing] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (search)
        query = query.or(
          `name.ilike.%${searchTerm(search)}%,email.ilike.%${searchTerm(search)}%,phone.ilike.%${searchTerm(search)}%`,
        );
      const { data, error } = await query
        .order("id")
        .range((page - 1) * 20, page * 20 - 1);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">View your customers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search customers..."
          className="input-field pl-12"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Phone
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Orders
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-20">
                  <Spinner />
                </td>
              </tr>
            ) : customers?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-500">
                  No customers yet
                </td>
              </tr>
            ) : (
              customers?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {c.name}
                    <button
                      onClick={() =>
                        setEditing({
                          id: c.id,
                          name: c.name || "",
                          phone: c.phone || "",
                          address: c.address || "",
                          state: c.state || "",
                          city: c.city || "",
                        })
                      }
                      className="ml-3 text-sm text-blue-600 underline"
                    >
                      Edit<span className="sr-only"> {c.name}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-4">{c.total_orders || 0}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.city || "-"}, {c.state || "-"}
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
        hasNext={(customers?.length || 0) === 20}
        loading={isLoading}
      />
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Customer details"
      >
        <div className="space-y-4">
          {editing &&
            ["name", "phone", "address", "state", "city"].map((field) => (
              <Input
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={editing[field]}
                onChange={(event) =>
                  setEditing({ ...editing, [field]: event.target.value })
                }
              />
            ))}
          <p className="text-xs text-gray-500">
            Email and order totals stay linked to order history.
          </p>
          <Button
            loading={saving}
            onClick={async () => {
              if (!editing) return;
              setSaving(true);
              try {
                const { id, ...changes } = editing;
                await saveAdminRecord("customers", changes, id);
                await client.invalidateQueries();
                setEditing(null);
                toast.success("Customer details saved");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Could not save",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            Save details
          </Button>
        </div>
      </Modal>
    </div>
  );
}
