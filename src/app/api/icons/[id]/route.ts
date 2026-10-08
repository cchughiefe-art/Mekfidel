import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single icon
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("uploaded_icons")
      .select("*")
      .eq("id", id)
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
      await manualAction("uploaded_icons", "update", await request.json(), id),
    );
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(
      await manualAction("uploaded_icons", "delete", {}, id),
    );
  } catch (error) {
    return adminError(error);
  }
}
