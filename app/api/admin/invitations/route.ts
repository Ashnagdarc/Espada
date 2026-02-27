import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { generateSecureToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const invitations = await prisma.adminInvitation.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Admin invitations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists as admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.adminInvitation.findFirst({
      where: { email, status: 'pending' }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 409 }
      );
    }

    // Get admin record for current user
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Generate invitation token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.adminInvitation.create({
      data: {
        email,
        token,
        adminId: admin.id,
        status: 'pending',
        expiresAt
      }
    });

    return NextResponse.json({ invitation }, { status: 201 });

  } catch (error) {
    console.error('Admin invitations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    await prisma.adminInvitation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin invitations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
