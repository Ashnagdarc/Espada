import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validatePassword } from '@/utils/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const admin = await prisma.admin.findUnique({
      where: { userId: user.id },
    });

    // Get customer profile if not admin
    let profile = null;
    if (!admin) {
      profile = await prisma.customerProfile.findUnique({
        where: { userId: user.id },
      });
    }

    // Log successful sign-in
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: `session_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      isAdmin: !!admin,
      profile: admin || profile,
    });

  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}