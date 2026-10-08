"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { saveAdminRecord, deleteAdminRecord } from "@/lib/utils/admin-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
type Row = {
  id: string;
  title?: string;
  content?: string;
  info_key?: string;
  block_key?: string;
  page?: string;
  position?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
};
const blank = {
  title: "",
  content: "",
  section: "story",
  page: "about",
  position: "bottom",
  image: "",
  is_active: true,
  sort_order: 0,
};
export default function PageText() {
  const [resource, setResource] = useState<"company_info" | "content_blocks">(
    "company_info",
  );
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const client = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-page-text", resource],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from(resource)
        .select("*")
        .order("sort_order")
        .order("id");
      if (error) throw error;
      return data as Row[];
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!form.content.trim())
        throw new Error("Enter the text you want to display");
      const shared = {
        title: form.title,
        content: form.content,
        is_active: form.is_active,
        sort_order: form.sort_order,
      };
      await saveAdminRecord(
        resource,
        resource === "company_info"
          ? {
              ...shared,
              info_key: form.section,
              info_type: "text",
              image: form.image || null,
            }
          : {
              ...shared,
              block_key:
                editing?.block_key || "text-" + crypto.randomUUID().slice(0, 8),
              block_type: "text",
              page: form.page,
              position: form.position,
            },
        editing?.id,
      );
    },
    onSuccess: async () => {
      await client.invalidateQueries();
      setOpen(false);
      toast.success("Page text saved");
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminRecord(resource, id),
    onSuccess: async () => {
      await client.invalidateQueries();
      toast.success("Text removed. Undo is available in change history.");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">About and page text</h1>
          <p className="mt-2 text-gray-500">
            Edit your company story or add text to a public page.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(blank);
            setOpen(true);
          }}
        >
          Add text
        </Button>
      </div>
      <div className="flex gap-3">
        <Button
          variant={resource === "company_info" ? "primary" : "outline"}
          onClick={() => setResource("company_info")}
        >
          Company information
        </Button>
        <Button
          variant={resource === "content_blocks" ? "primary" : "outline"}
          onClick={() => setResource("content_blocks")}
        >
          Page text
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <p>No text added yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"
            >
              <div>
                <p className="font-medium">
                  {row.title || row.info_key || row.page}
                </p>
                <p className="mt-1 max-w-xl truncate text-sm text-gray-500">
                  {row.content}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {row.is_active ? "Visible" : "Hidden"}
                  {row.page ? " · " + row.page : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(row);
                    setForm({
                      ...blank,
                      ...row,
                      title: row.title || "",
                      content: row.content || "",
                      section: row.info_key || "story",
                      image: row.image || "",
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        "Remove this text? You can undo it in change history.",
                      )
                    )
                      remove.mutate(row.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit text" : "Add text"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {resource === "company_info" ? (
            <Select
              label="Company section"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              options={[
                {
                  value: "business_description",
                  label: "Business description",
                },
                { value: "story", label: "Our story" },
                { value: "mission", label: "Mission" },
                { value: "vision", label: "Vision" },
                { value: "values", label: "Values" },
              ]}
            />
          ) : (
            <>
              <Select
                label="Page"
                value={form.page}
                onChange={(e) => setForm({ ...form, page: e.target.value })}
                options={[
                  "home",
                  "about",
                  "services",
                  "products",
                  "contact",
                  "privacy",
                  "terms",
                  "return-policy",
                ].map((value) => ({
                  value,
                  label: value.replaceAll("-", " "),
                }))}
              />
              <Select
                label="Placement"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                options={[
                  { value: "top", label: "Before the main content" },
                  { value: "bottom", label: "After the main content" },
                ]}
              />
            </>
          )}
          <Input
            label="Heading"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Text"
            required
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          {resource === "company_info" && (
            <Input
              label="Image URL (optional)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          )}
          <Input
            label="Display order"
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              setForm({ ...form, sort_order: Number(e.target.value) })
            }
          />
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Visible on the website
          </label>
          <Button type="submit" loading={save.isPending}>
            Save text
          </Button>
        </form>
      </Modal>
    </div>
  );
}
