import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], posts: [] });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [productsRes, postsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, price, images, category:categories(name)')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`)
        .limit(5),
      supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt')
        .eq('is_published', true)
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
        .limit(5),
    ]);

    return NextResponse.json({
      products: productsRes.data || [],
      posts: postsRes.data || [],
    });
  } catch {
    return NextResponse.json({ products: [], posts: [] });
  }
}

