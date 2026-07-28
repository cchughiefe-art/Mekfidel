import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single homepage section
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*, feature_cards(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a homepage section
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('homepage_sections')
      .update({
        section_key: body.section_key,
        section_type: body.section_type,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        button_text: body.button_text,
        button_url: body.button_url,
        image: body.image,
        background_image: body.background_image,
        icon: body.icon,
        color: body.color,
        background_color: body.background_color,
        sort_order: body.sort_order,
        is_active: body.is_active,
        metadata: body.metadata,
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

// DELETE - Delete a homepage section
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
