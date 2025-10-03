import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user in Stack Auth
    const user = await stackServerApp.createUser({
      primaryEmail: email,
      password: password,
      primaryEmailVerified: true, // Auto-verify admin users
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user in Stack Auth' },
        { status: 500 }
      );
    }

    // Create admin profile in Supabase using the seeding function
    const { data: profile, error: profileError } = await supabase
      .rpc('seed_admin_user', {
        p_stack_user_id: user.id,
        p_email: email,
        p_first_name: firstName || 'Admin',
        p_last_name: lastName || 'User'
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // Try to clean up the Stack Auth user if profile creation fails
      try {
        await user.delete();
      } catch (cleanupError) {
        console.error('Error cleaning up Stack Auth user:', cleanupError);
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
        id: user.id,
        email: user.primaryEmail,
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