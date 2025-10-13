import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';
import { validatePassword } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { password, accessToken } = await request.json();

    // Validate input
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // If access token is provided, set the session first (for password reset flow)
    if (accessToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Not needed for password update
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 401 }
        );
      }
    }

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 400 }
      );
    }

    // Log password change
    await supabase
      .from('email_notifications')
      .insert({
        user_id: data.user.id,
        email: data.user.email || '',
        type: 'password_changed',
        subject: 'Password Changed',
        content: 'Your password has been successfully changed.',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('Password update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}