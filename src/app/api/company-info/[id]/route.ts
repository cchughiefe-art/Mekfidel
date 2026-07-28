import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single company info
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update company info
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('company_info')
      .update({
        info_key: body.info_key,
        info_type: body.info_type,
        title: body.title,
        content: body.content,
        image: body.image,
        icon_library: body.icon_library,
        icon_name: body.icon_name,
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

// DELETE - Delete company info
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('company_info')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
