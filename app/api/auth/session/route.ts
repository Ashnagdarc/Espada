import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            const store = await cookies()
            return store.getAll()
          },
          async setAll(cookiesToSet) {
            try {
              const store = await cookies()
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  store.set(name, value, options)
                } catch {
                  // Ignore if setting cookies is not available in this context
                }
              })
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: sessionError.message },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { user: null, session: null, isAdmin: false, profile: null },
        { status: 200 }
      );
    }

    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Get customer profile if not admin
    let profileData = null;
    if (!adminData) {
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      
      profileData = customerData;
    }

    return NextResponse.json({
      user: session.user,
      session: session,
      isAdmin: !!adminData,
      profile: adminData || profileData,
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            const store = await cookies()
            return store.getAll()
          },
          async setAll(cookiesToSet) {
            try {
              const store = await cookies()
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  store.set(name, value, options)
                } catch {
                  // Ignore if setting cookies is not available in this context
                }
              })
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('Session refresh error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    // Get customer profile if not admin
    let profileData = null;
    if (!adminData) {
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();
      
      profileData = customerData;
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      isAdmin: !!adminData,
      profile: adminData || profileData,
    });

  } catch (error) {
    console.error('Session refresh API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}