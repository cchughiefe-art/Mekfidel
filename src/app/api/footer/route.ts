import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all footer sections
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('footer_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new footer section
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('footer_sections')
      .insert({
        section_key: body.section_key,
        title: body.title,
        content: body.content,
        icon_library: body.icon_library,
        icon_name: body.icon_name,
        links: body.links ?? [],
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
