import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all feature cards or by section
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('section_id');
    
    const supabase = createServiceClient();
    let query = supabase
      .from('feature_cards')
      .select('*')
      .order('sort_order', { ascending: true });

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new feature card
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('feature_cards')
      .insert({
        section_id: body.section_id,
        title: body.title,
        description: body.description,
        icon_library: body.icon_library ?? 'lucide',
        icon_name: body.icon_name,
        icon_color: body.icon_color,
        url: body.url,
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
