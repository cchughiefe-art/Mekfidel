import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { readJson, BodyTooLargeError } from "@/lib/utils/request-body";
import { createServiceRoleClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    const input = z
      .object({
        email: z.string().trim().email().max(254).toLowerCase(),
        consent: z.literal(true),
      })
      .parse(await readJson(request, 2048));
    const db = createServiceRoleClient();
    const source =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || "local";
    const sourceKey = createHash("sha256")
      .update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:newsletter:${source}`)
      .digest("hex");
    for (const [key, limit] of [
      ["newsletter:global", 500],
      ["newsletter:source:" + sourceKey, 10],
    ] as const) {
      const { data, error } = await db.rpc("consume_request_limit", {
        p_key: key,
        p_limit: limit,
        p_seconds: 3600,
      });
      if (error) throw error;
      if (!data)
        return NextResponse.json(
          { error: "Too many subscription attempts. Please try again later." },
          { status: 429, headers: { "Retry-After": "3600" } },
        );
    }
    const { data: allowed, error: limitError } = await db.rpc(
      "consume_request_limit",
      { p_key: "newsletter:" + input.email, p_limit: 3, p_seconds: 3600 },
    );
    if (limitError) throw limitError;
    if (!allowed)
      return NextResponse.json(
        { error: "Please wait before subscribing again." },
        { status: 429 },
      );
    const { error } = await db
      .from("newsletter_subscribers")
      .upsert(
        { email: input.email, consented_at: new Date().toISOString() },
        { onConflict: "email" },
      );
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BodyTooLargeError)
      return NextResponse.json(
        { error: "Request is too large" },
        { status: 413 },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? "Enter a valid email and consent to updates."
            : "Could not save your subscription. Please try again.",
      },
      { status: error instanceof z.ZodError ? 400 : 503 },
    );
  }
}
