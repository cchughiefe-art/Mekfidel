import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all homepage sections
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*, feature_cards(*)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new homepage section
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('homepage_sections')
      .insert({
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
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
        metadata: body.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
