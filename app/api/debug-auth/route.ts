import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug auth endpoint called');
    console.log('🔑 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
    
    // First, let's check all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('customer_profiles')
      .select('*');
      
    console.log('📊 All profiles:', { allProfiles, allError });
    
    // Check if we can find the admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', 'daniel.nonso48@gmail.com')
      .single();

    if (profileError) {
      console.error('❌ Error fetching admin profile:', profileError);
      return NextResponse.json({
        success: false,
        error: 'Error fetching admin profile',
        details: profileError
      }, { status: 500 });
    }

    console.log('✅ Admin profile found:', adminProfile);

    return NextResponse.json({
      success: true,
      adminProfile,
      message: 'Admin profile retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Unexpected error in debug auth:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}