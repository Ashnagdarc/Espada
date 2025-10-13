import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';

export async function GET(request: NextRequest) {
  void request;
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({
        isAdmin: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    // Check if user is admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    return NextResponse.json({
      isAdmin: true,
      role: admin.role,
    });

  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}