import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply middleware to admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Skip auth routes and seed route (for initial admin setup)
    if (request.nextUrl.pathname.startsWith('/api/admin/auth') || 
        request.nextUrl.pathname === '/api/admin/seed') {
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