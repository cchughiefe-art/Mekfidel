import { notifyContentChange } from "./content-sync";
import type { CmsResource } from "@/lib/ai-cms/types";
export async function saveAdminRecord(
  resource: CmsResource,
  changes: Record<string, unknown>,
  id?: string,
  original?: Record<string, unknown>,
) {
  const response = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource,
      operation: id ? "update" : "create",
      targetId: id,
      original,
      targetLabel: String(changes.name || changes.title || resource),
      changes,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save");
  notifyContentChange();
  return result;
}

export async function deleteAdminRecord(resource: CmsResource, id: string) {
  const response = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource,
      operation: "delete",
      targetId: id,
      targetLabel: resource,
      changes: {},
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not delete");
  notifyContentChange();
  return result;
}

export async function reorderAdminRecords(
  resource: CmsResource,
  records: Array<{ id: string; value: number }>,
  field = "sort_order",
) {
  const response = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      records.map((record) => ({
        resource,
        operation: "update",
        targetId: record.id,
        targetLabel: resource,
        changes: { [field]: record.value },
      })),
    ),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not reorder");
  notifyContentChange();
  return result;
}
