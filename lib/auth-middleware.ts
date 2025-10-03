import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, extractTokenFromHeaders, AdminTokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  admin?: AdminTokenPayload;
}

/**
 * Enhanced admin authentication middleware with JWT support
 */
export async function authenticateAdmin(request: NextRequest): Promise<{
  success: boolean;
  admin?: AdminTokenPayload;
  response?: NextResponse;
}> {
  try {
    const token = extractTokenFromHeaders(request.headers);
    
    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // Try JWT verification first
    const adminPayload = verifyAdminToken(token);
    if (adminPayload) {
      return {
        success: true,
        admin: adminPayload
      };
    }

    // Fallback to simple session token for backward compatibility
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (sessionSecret && token === sessionSecret) {
      // Create a mock admin payload for backward compatibility
      const mockAdmin: AdminTokenPayload = {
        adminId: 'legacy-admin',
        email: 'admin@espada.com',
        role: 'admin'
      };
      
      return {
        success: true,
        admin: mockAdmin
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
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
  handler: (request: AuthenticatedRequest, admin: AdminTokenPayload) => Promise<NextResponse>
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
 * Check if user has required permissions
 */
export function hasPermission(admin: AdminTokenPayload, requiredRole: string = 'admin'): boolean {
  return admin.role === requiredRole || admin.role === 'super_admin';
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