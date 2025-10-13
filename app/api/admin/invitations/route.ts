import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin, generateSecureToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('admin_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invitations, error } = await query;

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Admin invitations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { email, role = 'admin' } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists as admin
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('admin_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 409 }
      );
    }

    // Generate invitation token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('admin_invitations')
      .insert({
        email,
        role,
        token,
        invited_by: admin.session.user.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/accept-invitation?token=${token}`;
    
    await supabase
      .from('email_notifications')
      .insert({
        user_id: null, // No user ID for invitations
        email,
        type: 'admin_invitation',
        subject: 'Admin Invitation - Espada',
        content: `You have been invited to join Espada as an admin. Click the link to accept: ${invitationUrl}`,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      invitation: {
        ...invitation,
        invitation_url: invitationUrl,
      },
    });

  } catch (error) {
    console.error('Admin invitation creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { id, status } = await request.json();

    // Validate input
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Invitation ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'accepted', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update invitation status
    const { data: invitation, error } = await supabase
      .from('admin_invitations')
      .update({
        status,
        ...(status === 'accepted' && { accepted_at: new Date().toISOString() }),
        ...(status === 'rejected' && { rejected_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invitation:', error);
      return NextResponse.json(
        { error: 'Failed to update invitation' },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitation });

  } catch (error) {
    console.error('Admin invitation update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}