import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all navigation items or by location
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    const supabase = createServiceClient();
    let query = supabase
      .from('navigation_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new navigation item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('navigation_items')
      .insert({
        location: body.location,
        label: body.label,
        url: body.url,
        icon_library: body.icon_library,
        icon_name: body.icon_name,
        parent_id: body.parent_id,
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
        is_new_tab: body.is_new_tab ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
