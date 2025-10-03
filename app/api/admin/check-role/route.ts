import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { isUserAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isAdmin = await isUserAdmin(user.id);

    return NextResponse.json({
      isAdmin,
      userId: user.id,
      email: user.primaryEmail
    });

  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}