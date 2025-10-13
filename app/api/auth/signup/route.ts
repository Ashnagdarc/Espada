import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateEmail, validatePassword } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
        { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' },
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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('customer_profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.error('Sign up error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      );
    }

    // Create customer profile
    const { data: profileData, error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        auth_user_id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Send welcome email notification
    await supabase
      .from('email_notifications')
      .insert({
        user_id: authData.user.id,
        email: email,
        type: 'welcome',
        subject: 'Welcome to Espada!',
        content: `Welcome ${firstName}! Thank you for joining Espada. We're excited to have you as part of our community.`,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      profile: profileData,
      message: 'Account created successfully. Please check your email for verification.',
    });

  } catch (error) {
    console.error('Sign up API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}