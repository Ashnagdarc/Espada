import { stackServerApp } from '@/stack/server';
import { supabase } from '@/lib/supabase';

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // Resolve the email for the current user via Stack Auth
    const currentUser = await stackServerApp.getUser();
    const email = currentUser?.primaryEmail;

    if (!email) {
      return false;
    }

    // Check dedicated admins table (email is the single source of truth)
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAdmin(userId: string) {
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  return true;
}

export async function getAdminProfile(userId: string) {
  try {
    const currentUser = await stackServerApp.getUser();
    const email = currentUser?.primaryEmail || '';

    const { data, error } = await supabase
      .from('admins')
      .select('email, created_at')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    return null;
  }
}

export async function createAdminMiddleware() {
  return async (request: Request) => {
    try {
      const user = await stackServerApp.getUser();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const isAdmin = await isUserAdmin(user.id);
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return null; // Continue to the actual handler
    } catch (error) {
      console.error('Admin middleware error:', error);
      return new Response(JSON.stringify({ error: 'Authentication error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}