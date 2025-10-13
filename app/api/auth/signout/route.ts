import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Update user session record
      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
        })
        .eq('session_id', session.access_token);
    }

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Signed out successfully',
    });

  } catch (error) {
    console.error('Sign out API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}