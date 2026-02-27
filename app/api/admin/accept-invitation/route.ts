import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await prisma.adminInvitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    if (invitation.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 400 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation has already been used or expired' },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'admin'
        }
      });
    } else {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin'
        }
      });
    }

    // Create admin record
    await prisma.admin.create({
      data: {
        userId: user.id,
        email
      }
    });

    // Update invitation status
    await prisma.adminInvitation.update({
      where: { token },
      data: { status: 'accepted' }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully'
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
