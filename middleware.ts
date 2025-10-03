import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, extractTokenFromHeaders } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  // Only apply middleware to admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Skip auth routes
    if (request.nextUrl.pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next();
    }

    const token = extractTokenFromHeaders(request.headers);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Try JWT verification first
    const adminPayload = verifyAdminToken(token);
    if (adminPayload) {
      // Add admin info to headers for the API route
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-id', adminPayload.adminId);
      requestHeaders.set('x-admin-email', adminPayload.email);
      requestHeaders.set('x-admin-role', adminPayload.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Fallback to simple session token for backward compatibility
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (sessionSecret && token === sessionSecret) {
      // Add mock admin info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-id', 'legacy-admin');
      requestHeaders.set('x-admin-email', 'admin@espada.com');
      requestHeaders.set('x-admin-role', 'admin');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
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