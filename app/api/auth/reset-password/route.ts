import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';
import { validateEmail } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if user exists
    const { data: userData } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (userData) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/confirm`,
      });

      if (error) {
        console.error('Password reset error:', error);
        // Still return success to prevent enumeration
      } else {
        // Log password reset request
        await supabase
          .from('email_notifications')
          .insert({
            user_id: null, // We don't have the auth user ID here
            email: email,
            type: 'password_reset',
            subject: 'Password Reset Request',
            content: 'A password reset was requested for your account.',
            status: 'sent',
            created_at: new Date().toISOString(),
          });
      }
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}