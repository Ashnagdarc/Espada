import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, generateAdminToken, shouldRefreshToken, extractTokenFromHeaders } from '@/lib/jwt';

// POST /api/admin/auth/refresh - Refresh JWT token
export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the current token
    const adminPayload = verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if token should be refreshed
    if (!shouldRefreshToken(token)) {
      return NextResponse.json({
        success: true,
        token,
        message: 'Token is still valid'
      });
    }

    // Generate new token with same payload
    const newToken = generateAdminToken({
      adminId: adminPayload.adminId,
      email: adminPayload.email,
      role: adminPayload.role
    });

    return NextResponse.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin/auth/refresh - Check token status
export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeaders(request.headers);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const adminPayload = verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      shouldRefresh: shouldRefreshToken(token),
      user: {
        id: adminPayload.adminId,
        email: adminPayload.email,
        role: adminPayload.role
      }
    });
  } catch (error) {
    console.error('Error checking token status:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 500 }
    );
  }
}