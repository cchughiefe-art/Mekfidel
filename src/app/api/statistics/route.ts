import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET - Fetch all statistics or by context
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context');
    
    const supabase = createServiceClient();
    let query = supabase
      .from('statistics')
      .select('*')
      .order('sort_order', { ascending: true });

    if (context) {
      query = query.eq('context', context);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new statistic
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('statistics')
      .insert({
        context: body.context ?? 'homepage',
        label: body.label,
        value: body.value,
        suffix: body.suffix,
        icon_library: body.icon_library ?? 'lucide',
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
