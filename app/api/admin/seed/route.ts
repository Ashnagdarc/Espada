import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName || 'Admin'} ${lastName || 'User'}`,
        emailVerified: new Date(), // Auto-verify admin users
        role: 'ADMIN',
      },
    });

    // Create admin profile in Admin table
    const admin = await prisma.admin.create({
      data: {
        userId: user.id,
        email: user.email!,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        adminProfile: admin,
      }
    });

  } catch (error) {
    console.error('Error seeding admin user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}