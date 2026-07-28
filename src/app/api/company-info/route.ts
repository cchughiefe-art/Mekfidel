import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all company info or by key
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    const supabase = createServiceClient();
    
    if (key) {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('info_key', key)
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new company info
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('company_info')
      .insert({
        info_key: body.info_key,
        info_type: body.info_type ?? 'text',
        title: body.title,
        content: body.content,
        image: body.image,
        icon_library: body.icon_library,
        icon_name: body.icon_name,
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
