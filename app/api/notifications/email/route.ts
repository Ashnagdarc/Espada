import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let query = supabase
      .from('email_notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications,
      pagination: {
        limit,
        offset,
        total: notifications?.length || 0,
      },
    });

  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { email, type, subject, content } = await request.json();

    // Validate input
    if (!email || !type || !subject || !content) {
      return NextResponse.json(
        { error: 'Email, type, subject, and content are required' },
        { status: 400 }
      );
    }

    // Create email notification
    const { data: notification, error } = await supabase
      .from('email_notifications')
      .insert({
        user_id: session.user.id,
        email,
        type,
        subject,
        content,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Here you would typically integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll just mark it as sent
    await supabase
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id);

    return NextResponse.json({
      notification: {
        ...notification,
        status: 'sent',
        sent_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Email notification creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { id, status } = await request.json();

    // Validate input
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Notification ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'sent', 'failed', 'read'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update notification status
    const { data: notification, error } = await supabase
      .from('email_notifications')
      .update({
        status,
        ...(status === 'sent' && { sent_at: new Date().toISOString() }),
        ...(status === 'read' && { read_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .eq('user_id', session.user.id) // Ensure user can only update their own notifications
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification });

  } catch (error) {
    console.error('Email notification update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}