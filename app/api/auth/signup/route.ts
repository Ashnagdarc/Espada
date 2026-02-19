import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validatePassword } from '@/utils/auth';
import { hashPassword } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
        { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with customer profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: 'customer',
        profile: {
          create: {
            email,
            firstName,
            lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Create welcome email notification
    await prisma.emailNotification.create({
      data: {
        email: email,
        type: 'welcome',
        subject: 'Welcome to Espada!',
        message: `Welcome ${firstName}! Thank you for joining Espada. We're excited to have you as part of our community.`,
        status: 'pending',
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      profile: user.profile,
      message: 'Account created successfully. Please check your email for verification.',
    });

  } catch (error) {
    console.error('Sign up API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}