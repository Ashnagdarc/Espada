import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    console.log(`🗑️ Removing user profile for: ${email}`);

    // First, check if the user exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message,
        details: fetchError
      }, { status: 500 });
    }

    if (!existingProfile) {
      return NextResponse.json({
        success: true,
        message: `User ${email} not found in customer_profiles table`,
        alreadyRemoved: true
      });
    }

    // Delete the user profile
    const { error: deleteError } = await supabaseAdmin
      .from('customer_profiles')
      .delete()
      .eq('email', email);

    if (deleteError) {
      console.error('❌ Error deleting profile:', deleteError);
      return NextResponse.json({
        success: false,
        error: deleteError.message,
        details: deleteError
      }, { status: 500 });
    }

    console.log('✅ User profile deleted successfully');

    return NextResponse.json({
      success: true,
      message: `User ${email} has been successfully removed from customer_profiles table`,
      removedProfile: {
        id: existingProfile.id,
        email: existingProfile.email,
        stack_user_id: existingProfile.stack_user_id,
        role: existingProfile.role,
        created_at: existingProfile.created_at
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check if user exists before deletion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, email, stack_user_id, role, created_at')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      exists: !!profile,
      profile: profile || null,
      message: profile 
        ? `User ${email} exists in customer_profiles table`
        : `User ${email} not found in customer_profiles table`
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}