import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'daniel.nonso48@gmail.com';

    console.log(`🔍 Checking user profile for: ${email}`);

    // Query the customer_profiles table
    const { data: profile, error } = await supabaseAdmin
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    if (!profile) {
      console.log('❌ User not found in customer_profiles table');
      
      // Also check if user exists in auth.users table
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      const authUser = authUsers?.users?.find(user => 
        user.email === email || 
        user.user_metadata?.email === email ||
        user.identities?.some(identity => identity.identity_data?.email === email)
      );

      return NextResponse.json({
        success: true,
        found: false,
        profile: null,
        authUser: authUser ? {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          user_metadata: authUser.user_metadata,
          identities: authUser.identities
        } : null,
        message: `User ${email} not found in customer_profiles table`,
        recommendations: [
          'User may need to sign in first to create a profile',
          'Check if the email is correct',
          'Verify if user exists in Stack Auth but profile creation failed'
        ]
      });
    }

    console.log('✅ User profile found:', profile);

    // Check if role is admin
    const isAdmin = profile.role === 'admin';
    
    return NextResponse.json({
      success: true,
      found: true,
      profile: {
        id: profile.id,
        stack_user_id: profile.stack_user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postal_code,
        country: profile.country,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        preferences: profile.preferences
      },
      analysis: {
        isAdmin,
        roleStatus: isAdmin ? 'CORRECT - User has admin role' : 'NEEDS UPDATE - User role is not admin',
        canAccessAdminDashboard: isAdmin,
        profileComplete: !!(profile.first_name && profile.last_name),
        hasContactInfo: !!(profile.phone || profile.address)
      },
      recommendations: isAdmin ? [
        'User is properly configured as admin',
        'Should be able to access admin dashboard at /admin',
        'Role-based redirect should work correctly'
      ] : [
        'Update user role to "admin" to enable admin access',
        'Use the update endpoint or SQL to change role',
        'After role update, user should be redirected to /admin on login'
      ]
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

// POST endpoint to update user role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role = 'admin' } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    console.log(`🔄 Updating role for ${email} to ${role}`);

    // Update the user's role
    const { data, error } = await supabaseAdmin
      .from('customer_profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating role:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('✅ Role updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role} for ${email}`,
      profile: data
    });

  } catch (error) {
    console.error('❌ Unexpected error in POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}