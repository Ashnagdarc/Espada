import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  void request;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        isAdmin: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin';

    return NextResponse.json({
      isAdmin,
      role: session.user.role,
    });

  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
