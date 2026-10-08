import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    const input = z
      .object({
        email: z.string().trim().email().max(254).toLowerCase(),
        consent: z.literal(true),
      })
      .parse(await request.json());
    const db = createServiceRoleClient();
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
