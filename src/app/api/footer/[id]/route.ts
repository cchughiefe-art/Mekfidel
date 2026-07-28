import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single footer section
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('footer_sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a footer section
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('footer_sections')
      .update({
        section_key: body.section_key,
        title: body.title,
        content: body.content,
        icon_library: body.icon_library,
        icon_name: body.icon_name,
        links: body.links,
        sort_order: body.sort_order,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a footer section
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('footer_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
