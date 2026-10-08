import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET - Fetch all statistics or by context
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context");

    const supabase = createServiceClient();
    let query = supabase
      .from("statistics")
      .select("*")
      .eq("is_verified", true)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (context) {
      query = query.eq("context", context);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(
      await manualAction("statistics", "create", await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return adminError(error);
  }
}
