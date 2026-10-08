import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET - Fetch all feature cards or by section
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");

    const supabase = createServiceClient();
    let query = supabase
      .from("feature_cards")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (sectionId) {
      query = query.eq("section_id", sectionId);
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
      await manualAction("feature_cards", "create", await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return adminError(error);
  }
}
