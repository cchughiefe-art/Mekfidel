"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { saveAdminRecord } from "@/lib/utils/admin-actions";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";

export default function AdminUsersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{
    id: string;
    full_name: string;
    role: string;
  } | null>(null);
  const [role, setRole] = useState("viewer");
  const [saving, setSaving] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error: queryError1 } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError1) throw queryError1;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">
          Manage existing team access. Administrators manage the business;
          editors manage content; viewers have no admin access.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                User
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Role
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Joined
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
              users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.full_name?.charAt(0) || "A"}
                      </div>
                      <span className="font-medium">
                        {user.full_name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === "admin" ? "danger" : "info"}>
                      {user.role || "viewer"}
                    </Badge>
                    <button
                      onClick={() => {
                        setEditing(user);
                        setRole(user.role || "viewer");
                      }}
                      className="ml-3 text-sm font-semibold text-blue-600 underline"
                    >
                      Change role
                      <span className="sr-only"> for {user.full_name}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Change team access"
      >
        <p className="mb-4 text-sm">
          You are changing access for{" "}
          <strong>{editing?.full_name || "this team member"}</strong>. Keep at
          least one administrator.
        </p>
        <Select
          label="New role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={[
            { value: "admin", label: "Administrator — full control" },
            { value: "editor", label: "Editor — website content" },
            { value: "viewer", label: "Viewer — no admin access" },
          ]}
        />
        <Button
          className="mt-5"
          loading={saving}
          onClick={async () => {
            if (!editing) return;
            setSaving(true);
            try {
              await saveAdminRecord("profiles", { role }, editing.id);
              await queryClient.invalidateQueries();
              setEditing(null);
              toast.success("Team access updated");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Could not change role",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          Confirm access change
        </Button>
      </Modal>
    </div>
  );
}
