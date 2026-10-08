import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET - Fetch all homepage sections
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*, feature_cards(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(
      data?.map((section) => ({
        ...section,
        feature_cards: section.feature_cards?.filter(
          (card: { is_active: boolean }) => card.is_active,
        ),
      })),
    );
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
      await manualAction("homepage_sections", "create", await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return adminError(error);
  }
}
