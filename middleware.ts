import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Protect admin routes (both pages and API)
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set(name: string, value: string, options: any) {
              res.cookies.set(name, value, options);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            remove(name: string, options: any) {
              res.cookies.set(name, '', { ...options, maxAge: 0 });
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      // If no session, redirect to signin with return URL
      if (!session) {
        const redirectUrl = new URL('/signin', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is admin by checking the admins table
      const { data: adminData } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email)
        .single();

      // If not admin, redirect to home
      if (!adminData) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return res;
    } catch (error) {
      console.error('Middleware auth error:', error);
      // On error, redirect to signin for safety
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Skip auth routes and seed route (for initial admin setup)
    if (pathname.startsWith('/api/admin/auth') || 
        pathname === '/api/admin/seed') {
      return NextResponse.next();
    }

    // For admin API routes, let the individual route handlers handle authentication
    // This avoids edge runtime issues with JWT verification
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};