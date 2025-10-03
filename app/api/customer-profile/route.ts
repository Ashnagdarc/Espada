import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stackUserId = searchParams.get('stack_user_id');
    const email = searchParams.get('email');

    if (!stackUserId && !email) {
      return NextResponse.json({
        success: false,
        error: 'Either stack_user_id or email is required'
      }, { status: 400 });
    }

    let query = supabase.from('customer_profiles').select('*');
    
    if (stackUserId) {
      query = query.eq('stack_user_id', stackUserId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: profile, error } = await query.single();

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
    const body = await request.json();
    const { stack_user_id, email, first_name, last_name, role = 'customer' } = body;

    if (!stack_user_id || !email) {
      return NextResponse.json({
        success: false,
        error: 'stack_user_id and email are required'
      }, { status: 400 });
    }

    // Check if profile already exists by email
    const { data: existingProfile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existingProfile) {
      // Update existing profile with new stack_user_id
      const { data: updatedProfile, error: updateError } = await supabase
        .from('customer_profiles')
        .update({ stack_user_id })
        .eq('email', email)
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

    // Create new profile
    const isAdminEmail = email === 'daniel.nonso48@gmail.com';
    const defaultRole = isAdminEmail ? 'admin' : role;

    const newProfile = {
      stack_user_id,
      email,
      first_name: first_name || '',
      last_name: last_name || '',
      role: defaultRole,
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
      console.error('❌ Error creating profile:', createError);
      return NextResponse.json({
        success: false,
        error: 'Error creating profile',
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
    const body = await request.json();
    const { stack_user_id, ...updateData } = body;

    if (!stack_user_id) {
      return NextResponse.json({
        success: false,
        error: 'stack_user_id is required'
      }, { status: 400 });
    }

    // Get current profile to check for admin protection
    const { data: currentProfile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('stack_user_id', stack_user_id)
      .single();

    if (currentProfile?.email === 'daniel.nonso48@gmail.com' && updateData.role && updateData.role !== 'admin') {
      console.warn('🚫 Preventing role change for admin user');
      delete updateData.role; // Remove role from update data
    }

    const { data: updatedProfile, error } = await supabase
      .from('customer_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('stack_user_id', stack_user_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return NextResponse.json({
        success: false,
        error: 'Error updating profile',
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