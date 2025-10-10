import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  void request;
  try {
    // Always return admin true since auth is removed
    return NextResponse.json({
      isAdmin: true,
    });

  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { isAdmin: true, error: 'Internal server error' },
      { status: 500 }
    );
  }
}