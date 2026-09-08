import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedApiPrefixes = [
  '/api/company-info',
  '/api/feature-cards',
  '/api/footer',
  '/api/homepage-sections',
  '/api/icons',
  '/api/navigation',
  '/api/services',
  '/api/social-links',
  '/api/statistics',
  '/api/upload',
];

export async function proxy(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isProtectedApiMutation =
    request.method !== 'GET' &&
    protectedApiPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix));

  if (!isAdminPage && !isProtectedApiMutation) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return isAdminPage
      ? NextResponse.redirect(new URL('/auth/login', request.url))
      : NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: cookiesToSet => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  let authorized = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    authorized = profile?.role === 'admin' || profile?.role === 'editor';
  }

  if (!authorized) {
    if (isProtectedApiMutation) {
      return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 });
    }

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
