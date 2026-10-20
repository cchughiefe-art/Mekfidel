import "server-only";
import { NextResponse } from "next/server";
import {
  createAdminClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import { aiActionSchema, type CmsResource } from "./types";
import { prepareActions } from "./server";
export async function manualActions(inputs: unknown[]) {
  const auth = await createAdminClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const input = inputs.map((value) => aiActionSchema.parse(value));
  if (!input.length || input.length > 1000)
    throw new Error("Save between 1 and 1000 records at a time");
  const { data: profile } = await auth
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (
    profile?.role !== "admin" &&
    input.some((action) =>
      [
        "products",
        "categories",
        "brands",
        "screen_compatibility",
        "orders",
        "customers",
        "settings",
        "profiles",
      ].includes(action.resource),
    )
  )
    throw new Error("Forbidden");
  const actions = await prepareActions(auth, input);
  const db = createServiceRoleClient();
  const { data: request, error } = await db
    .from("ai_change_requests")
    .insert({
      created_by: user.id,
      instruction: `Manual: ${input[0].resource}`,
      summary: `Save ${input.length} ${input[0].resource.replaceAll("_", " ")} change(s)`,
      actions,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw new Error("Could not record your change");
  const { error: applyError } = await db.rpc("execute_admin_preview", {
    p_request_id: request.id,
    p_user_id: user.id,
    p_rollback: false,
  });
  if (applyError) throw new Error(applyError.message);
  return { id: request.id };
}
export async function manualAction(
  resource: CmsResource,
  operation: "create" | "update" | "delete",
  changes: Record<string, unknown>,
  targetId?: string,
  original?: Record<string, unknown>,
) {
  const request = await manualActions([
    {
      resource,
      operation,
      changes,
      targetId,
      original,
      targetLabel: String(
        changes.name || changes.title || changes.label || resource,
      ).slice(0, 200),
    },
  ]);
  if (operation === "delete") return { success: true };
  const db = createServiceRoleClient();
  const id =
    targetId ||
    (
      await db
        .from("ai_change_requests")
        .select("rollback_actions")
        .eq("id", request.id)
        .single()
    ).data?.rollback_actions?.[0]?.targetId;
  const { data, error } = await db
    .from(resource)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error("Change saved. Refresh the list to see it.");
  return data;
}
export function adminError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Could not save change";
  return NextResponse.json(
    { error: message },
    {
      status:
        message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400,
    },
  );
}
