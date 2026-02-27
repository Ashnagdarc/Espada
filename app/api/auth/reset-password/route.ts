import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateEmail, generateSecureToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    // Generate reset token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token (you may want to create a PasswordReset model)
    // For now, we'll use the VerificationToken model
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: expiresAt
      }
    });

    // TODO: Send email with reset link
    // const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
