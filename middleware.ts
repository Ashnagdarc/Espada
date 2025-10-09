import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { createClient } from '@supabase/supabase-js';

// Get JWKS URL for Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const JWKS_URL = `${SUPABASE_URL}/.well-known/jwks.json`;

// Create remote JWK set for verifying Supabase JWTs
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

// Create Supabase admin client for role checking
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SupabaseJWTPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: {
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

/**
 * Fast JWT validation using Supabase's public keys
 */
async function validateSupabaseToken(token: string): Promise<SupabaseJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    
    return payload as SupabaseJWTPayload;
  } catch (error) {
    console.log('🔍 JWT validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Extract token from cookies or authorization header
 */
function extractToken(request: NextRequest): string | null {
  // Try authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try Supabase auth token from cookies
  const authToken = request.cookies.get('sb-cdbbkhrotfbmcvicitei-auth-token');
  if (authToken?.value) {
    try {
      const parsed = JSON.parse(authToken.value);
      return parsed.access_token;
    } catch {
      // Ignore parsing errors
    }
  }

  return null;
}

/**
 * Check if user is admin by querying the database
 */
async function isAdminUser(email: string): Promise<boolean> {
  try {
    const { data: adminData } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    return !!adminData;
  } catch (error) {
    console.log('🔍 Admin check error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const startTime = Date.now();

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    console.log('🔒 Fast middleware: Checking admin route access for:', pathname);
    
    const token = extractToken(request);
    
    if (!token) {
      console.log('🔒 Fast middleware: No token found, redirecting to signin');
      return NextResponse.redirect(new URL(`/signin?redirect=${encodeURIComponent(pathname)}`, request.url));
    }

    const payload = await validateSupabaseToken(token);
    
    if (!payload) {
      console.log('🔒 Fast middleware: Invalid token, redirecting to signin');
      return NextResponse.redirect(new URL(`/signin?redirect=${encodeURIComponent(pathname)}`, request.url));
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('🔒 Fast middleware: Token expired, redirecting to signin');
      return NextResponse.redirect(new URL(`/signin?redirect=${encodeURIComponent(pathname)}`, request.url));
    }

    // Check if user is admin by querying the database
    if (!payload.email) {
      console.log('🔒 Fast middleware: No email in token, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isAdmin = await isAdminUser(payload.email);
    if (!isAdmin) {
      console.log('🔒 Fast middleware: User is not admin, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Fast middleware: Admin access granted for ${payload.email} in ${duration}ms`);
    
    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-id', payload.sub);
    
    return response;
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