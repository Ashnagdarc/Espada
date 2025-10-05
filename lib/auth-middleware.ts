import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  first_name?: string;
  last_name?: string;
}

export interface AuthenticatedRequest extends NextRequest {
  admin?: AdminUser;
}

/**
 * Admin authentication middleware using Supabase Auth
 */
export async function authenticateAdmin(request: NextRequest): Promise<{
  success: boolean;
  admin?: AdminUser;
  response?: NextResponse;
}> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // Verify user is an admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminError || !adminProfile) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      };
    }

    const admin: AdminUser = {
      id: adminProfile.id,
      email: adminProfile.email,
      role: 'admin',
      first_name: adminProfile.first_name,
      last_name: adminProfile.last_name
    };

    return {
      success: true,
      admin
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth(
  handler: (request: AuthenticatedRequest, admin: AdminUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateAdmin(request);
    
    if (!authResult.success || !authResult.admin) {
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Add admin info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.admin = authResult.admin;

    return handler(authenticatedRequest, authResult.admin);
  };
}

/**
 * Middleware wrapper for API routes with params
 */
export function withAuthParams<T>(
  handler: (request: AuthenticatedRequest, admin: AdminUser, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    const authResult = await authenticateAdmin(request);
    
    if (!authResult.success || !authResult.admin) {
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Add admin info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.admin = authResult.admin;

    return handler(authenticatedRequest, authResult.admin, context);
  };
}

/**
 * Check if user has required permissions
 */
export function hasPermission(admin: AdminUser, requiredRole: string = 'admin'): boolean {
  return admin.role === requiredRole;
}

/**
 * Rate limiting for authentication attempts
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  authAttempts.set(identifier, attempts);
  
  return true;
}