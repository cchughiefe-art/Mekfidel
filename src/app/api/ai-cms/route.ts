import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import { createAiPlan, providerAvailability } from "@/lib/ai-cms/server";

const requestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("plan"),
    instruction: z.string().trim().min(3).max(2000),
    provider: z.enum(["auto", "groq", "gemini"]).default("auto"),
  }),
  z.object({ operation: z.literal("apply"), requestId: z.string().uuid() }),
  z.object({ operation: z.literal("rollback"), requestId: z.string().uuid() }),
]);

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status =
    message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const auditClient = createServiceRoleClient();
    const requestId = new URL(request.url).searchParams.get("requestId");
    if (requestId) {
      z.string().uuid().parse(requestId);
      const { data, error } = await auditClient
        .from("ai_change_requests")
        .select("*")
        .eq("id", requestId)
        .eq("created_by", user.id)
        .single();
      if (error) throw new Error("Preview could not be found");
      return NextResponse.json({
        requestId: data.id,
        plan: {
          summary: data.summary,
          answer: data.answer || "",
          warnings: data.warnings || [],
          actions: data.actions,
          provider: data.provider,
          model: data.model,
        },
      });
    }
    const { data, error } = await auditClient
      .from("ai_change_requests")
      .select(
        "id,created_at,instruction,summary,status,applied_at,rolled_back_at,error,actions,provider,model",
      )
      .order("created_at", { ascending: false })
      .eq("created_by", user.id)
      .limit(20);
    if (error) throw error;
    return NextResponse.json({
      history: data?.map((item) => ({
        ...item,
        canUndo: !item.actions?.some(
          (action: { resource: string }) => action.resource === "orders",
        ),
      })),
      providers: providerAvailability(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const auditClient = createServiceRoleClient();
    const input = requestSchema.parse(await request.json());

    if (input.operation === "plan") {
      await createAdminClient(true);
      const { data: allowed, error: limitError } = await auditClient.rpc(
        "consume_request_limit",
        { p_key: "admin-ai:" + user.id, p_limit: 30, p_seconds: 3600 },
      );
      if (limitError) throw new Error("Could not verify AI request allowance");
      if (!allowed)
        return NextResponse.json(
          {
            error:
              "You have reached the assistant limit for this hour. Manual controls remain available.",
          },
          { status: 429 },
        );
      const plan = await createAiPlan(
        supabase,
        input.instruction,
        input.provider,
      );
      const { data, error } = await auditClient
        .from("ai_change_requests")
        .insert({
          created_by: user.id,
          instruction: input.instruction,
          summary: plan.summary,
          provider: plan.provider,
          model: plan.model,
          answer: plan.answer,
          warnings: plan.warnings,
          actions: plan.actions,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;
      return NextResponse.json({ requestId: data.id, plan });
    }

    const { error: fetchError } = await auditClient
      .from("ai_change_requests")
      .select("*")
      .eq("id", input.requestId)
      .eq("created_by", user.id)
      .single();
    if (fetchError) throw fetchError;

    const { data: result, error: actionError } = await auditClient.rpc(
      "execute_admin_preview",
      {
        p_request_id: input.requestId,
        p_user_id: user.id,
        p_rollback: input.operation === "rollback",
      },
    );
    if (actionError) throw new Error(actionError.message);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return errorResponse(error);
  }
}
