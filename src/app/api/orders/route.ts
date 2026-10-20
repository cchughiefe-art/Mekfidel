import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { readJson, BodyTooLargeError } from "@/lib/utils/request-body";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/utils/validators";
export async function POST(request: Request) {
  try {
    const parsed = createOrderSchema.safeParse(await readJson(request));
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order" },
        { status: 400 },
      );
    const key = request.headers.get("idempotency-key");
    if (
      !key ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        key,
      )
    )
      return NextResponse.json(
        { error: "A valid order reference is required" },
        { status: 400 },
      );
    const supabase = createServiceRoleClient();
    // Vercel supplies this header; do not use user-controlled forwarding chains as identities.
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || "local";
    const digest = createHash("sha256")
      .update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:checkout:${ip}`)
      .digest("hex");
    const { data: allowed, error: limitError } = await supabase.rpc(
      "consume_request_limit",
      { p_key: digest, p_limit: 10, p_seconds: 600 },
    );
    if (limitError) throw new Error("Order service is temporarily unavailable");
    if (!allowed)
      return NextResponse.json(
        { error: "Too many order attempts. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const { data: order, error } = await supabase.rpc("create_checkout", {
      p_body: parsed.data,
      p_key: key,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof BodyTooLargeError)
      return NextResponse.json(
        { error: "Order is too large" },
        { status: 413 },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { error: "Invalid order JSON" },
        { status: 400 },
      );
    console.error(
      "Checkout failed",
      error instanceof Error ? error.name : "unknown",
    );
    return NextResponse.json(
      { error: "Could not submit your request. Please try again." },
      { status: 503 },
    );
  }
}
