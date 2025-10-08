import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next();
    
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

    // If no session, redirect to signin
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // Check if user is admin
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