import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET - Fetch all company info or by key
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    const supabase = createServiceClient();

    if (key) {
      const { data, error } = await supabase
        .from("company_info")
        .select("*")
        .eq("info_key", key)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

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
      await manualAction("company_info", "create", await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return adminError(error);
  }
}
