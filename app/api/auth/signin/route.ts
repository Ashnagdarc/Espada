import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateEmail, validatePassword } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Sign in error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id, email')
      .eq('user_id', authData.user.id)
      .single();

    // Get customer profile if not admin
    let profileData = null;
    if (!adminData) {
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();
      
      profileData = customerData;
    }

    // Log successful sign-in
    await supabase
      .from('user_sessions')
      .insert({
        user_id: authData.user.id,
        session_id: authData.session?.access_token || '',
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      isAdmin: !!adminData,
      profile: adminData || profileData,
    });

  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}