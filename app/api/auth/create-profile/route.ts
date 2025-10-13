import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_user_id, email, first_name, last_name, phone } = body;

    console.log('Received profile creation request:', { auth_user_id, email, first_name, last_name, phone });

    if (!auth_user_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: auth_user_id and email' },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!UUID_REGEX.test(auth_user_id)) {
      console.error('Invalid UUID format for auth_user_id:', auth_user_id);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // First, verify that the user exists in auth.users table
    console.log('Verifying user exists in auth.users:', auth_user_id);
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(auth_user_id);
    
    if (authError || !authUser.user) {
      console.error('User not found in auth.users:', authError);
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    console.log('User verified in auth.users:', authUser.user.email);

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .eq('auth_user_id', auth_user_id)
      .single();

    if (existingProfile) {
      console.log('Profile already exists for user:', auth_user_id);
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 409 }
      );
    }

    // Create the customer profile using service role (bypasses RLS)
    const profileData = {
      auth_user_id,
      email,
      role: 'customer',
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(phone && { phone })
    };

    console.log('Creating profile with admin client:', profileData);

    const { data, error } = await supabaseAdmin
      .from('customer_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      
      // Provide more specific error messages
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'User authentication record not found. Please try again in a moment.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Profile created successfully:', data);
    return NextResponse.json({ profile: data });

  } catch (error) {
    console.error('Unexpected error in create-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}