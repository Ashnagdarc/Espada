import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password, firstName, lastName } = await request.json();

    // Validate input
    if (!token || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('admin_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      // Mark invitation as expired
      await supabase
        .from('admin_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Create admin user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.error('Admin signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create admin account' },
        { status: 400 }
      );
    }

    // Create admin profile
    const { data: adminProfile, error: adminError } = await supabase
      .from('admins')
      .insert({
        auth_user_id: authData.user.id,
        email: invitation.email,
        first_name: firstName,
        last_name: lastName,
        role: invitation.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (adminError) {
      console.error('Admin profile creation error:', adminError);
      // Clean up auth user if admin profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create admin profile' },
        { status: 500 }
      );
    }

    // Mark invitation as accepted
    await supabase
      .from('admin_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    // Send welcome email
    await supabase
      .from('email_notifications')
      .insert({
        user_id: authData.user.id,
        email: invitation.email,
        type: 'admin_welcome',
        subject: 'Welcome to Espada Admin',
        content: `Welcome ${firstName}! Your admin account has been successfully created.`,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      profile: adminProfile,
      message: 'Admin account created successfully',
    });

  } catch (error) {
    console.error('Accept invitation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Find invitation by token
    const { data: invitation, error } = await supabase
      .from('admin_invitations')
      .select('email, role, expires_at, status')
      .eq('token', token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
    });

  } catch (error) {
    console.error('Get invitation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}