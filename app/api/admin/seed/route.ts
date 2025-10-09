import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify admin users
    });

    if (authError || !authData.user) {
      console.error('Error creating user in Supabase Auth:', authError);
      return NextResponse.json(
        { error: 'Failed to create user in Supabase Auth' },
        { status: 500 }
      );
    }

    // Create admin profile in customer_profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .insert([{
        auth_user_id: authData.user.id,
        email: email,
        first_name: firstName || 'Admin',
        last_name: lastName || 'User',
        role: 'admin'
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // Try to clean up the Supabase Auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up Supabase Auth user:', cleanupError);
      }
      return NextResponse.json(
        { error: 'Failed to create admin profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Error seeding admin user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}