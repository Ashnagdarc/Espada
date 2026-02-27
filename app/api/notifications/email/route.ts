import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const notifications = await prisma.emailNotification.findMany({
      where: {
        email: session.user.email!,
        ...(status && { status }),
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error('Email notifications API error:', error);
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

    const { email, type, subject, message } = await request.json();

    if (!email || !type || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, type, subject, and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.emailNotification.create({
      data: {
        email,
        type,
        subject,
        message,
        status: 'pending'
      }
    });

    // TODO: Implement actual email sending logic here
    // For now, just create the notification record

    return NextResponse.json({ notification }, { status: 201 });

  } catch (error) {
    console.error('Email notifications API error:', error);
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
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await prisma.emailNotification.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
