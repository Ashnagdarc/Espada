import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found'
      }, { status: 404 });
    }

    // Transform to snake_case for frontend
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        role: 'customer' as const,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postalCode,
        country: profile.country,
        created_at: profile.createdAt?.toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();
    const { email, first_name, last_name, phone, address, city, postal_code, country } = body;

    // Use session email if not provided
    const profileEmail = email || session.user.email || '';
    
    if (!profileEmail) {
      return NextResponse.json({
        success: false,
        error: 'email is required'
      }, { status: 400 });
    }

    const profile = await prisma.customerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        phone,
        address,
        city,
        postalCode: postal_code,
        country,
      },
      create: {
        userId: session.user.id,
        email: profileEmail,
        firstName: first_name || '',
        lastName: last_name || '',
        phone,
        address,
        city,
        postalCode: postal_code,
        country,
      },
    });

    // Transform to snake_case for frontend
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        role: 'customer' as const,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postalCode,
        country: profile.country,
        created_at: profile.createdAt?.toISOString(),
      },
      action: 'updated'
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile creation:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();

    const updatedProfile = await prisma.customerProfile.update({
      where: { userId: session.user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        first_name: updatedProfile.firstName,
        last_name: updatedProfile.lastName,
        phone: updatedProfile.phone,
        address: updatedProfile.address,
        city: updatedProfile.city,
        postal_code: updatedProfile.postalCode,
        country: updatedProfile.country,
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in customer profile update:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}