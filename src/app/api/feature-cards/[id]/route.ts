import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single feature card
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("feature_cards")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(
      await manualAction("feature_cards", "update", await request.json(), id),
    );
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(
      await manualAction("feature_cards", "delete", {}, id),
    );
  } catch (error) {
    return adminError(error);
  }
}
