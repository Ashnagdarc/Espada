import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Get user's profile using auth_user_id
    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching customer profile:', error);
      return NextResponse.json({
        success: false,
        error: 'Error fetching customer profile',
        details: error
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();
    const { email, first_name, last_name } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'email is required'
      }, { status: 400 });
    }

    // Check if this is an admin email - admin users should not have customer profiles
    const isAdminEmail = email === 'daniel.nonso48@gmail.com';
    if (isAdminEmail) {
      return NextResponse.json({
        success: false,
        error: 'Admin users are managed separately and should not have customer profiles',
        isAdmin: true
      }, { status: 400 });
    }

    // Check if profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('customer_profiles')
        .update({ email, first_name, last_name })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating existing profile:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Error updating existing profile',
          details: updateError
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        profile: updatedProfile,
        action: 'updated'
      });
    }

    // Create new customer profile (only for non-admin users)
    const newProfile = {
      auth_user_id: user.id,
      email,
      first_name: first_name || '',
      last_name: last_name || '',
      preferences: {
        newsletter: false,
        smsUpdates: false,
      },
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('customer_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating customer profile:', createError);
      return NextResponse.json({
        success: false,
        error: 'Error creating customer profile',
        details: createError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: createdProfile,
      action: 'created'
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile creation:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();
    const { ...updateData } = body;

    const { data: updatedProfile, error } = await supabase
      .from('customer_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating customer profile:', error);
      return NextResponse.json({
        success: false,
        error: 'Error updating customer profile',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile update:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}