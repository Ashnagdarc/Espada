import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { isUserAdmin, getAdminProfile } from '@/lib/auth/admin';

export interface AdminUser {
  id: string;
  email: string;
  profile: any;
}

export type AdminHandler = (
  request: NextRequest,
  admin: AdminUser,
  params?: any
) => Promise<NextResponse>;

export function withStackAdminAuth(handler: AdminHandler) {
  return async (request: NextRequest, params?: any) => {
    try {
      // Get the current user from Stack Auth
      const user = await stackServerApp.getUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if user is admin
      const isAdmin = await isUserAdmin(user.id);
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Get admin profile
      const profile = await getAdminProfile(user.id);
      if (!profile) {
        return NextResponse.json(
          { error: 'Admin profile not found' },
          { status: 403 }
        );
      }

      const adminUser: AdminUser = {
        id: user.id,
        email: user.primaryEmail || '',
        profile
      };

      // Call the actual handler with admin user context
      return await handler(request, adminUser, params);

    } catch (error) {
      console.error('Stack Admin Auth Error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

// Helper function for route handlers that need params
export function withStackAdminAuthParams(handler: AdminHandler) {
  return (request: NextRequest, context: { params: any }) => {
    const wrappedHandler = withStackAdminAuth(handler);
    return wrappedHandler(request, context.params);
  };
}