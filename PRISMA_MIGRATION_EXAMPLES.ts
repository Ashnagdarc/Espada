// Example: Converting API Routes from Supabase to Prisma

// ============================================
// BEFORE: Supabase Version
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/auth';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
*/

// ============================================
// AFTER: Prisma with NextAuth Version
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    // NextAuth session provides user info
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use Prisma to query the database
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { firstName, lastName, phone, address, city, postalCode, country } = await request.json();

    // Update or create profile with Prisma
    const profile = await prisma.customerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
        country,
      },
      create: {
        userId: session.user.id,
        email: session.user.email!,
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
        country,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ============================================
// Common Prisma Query Patterns
// ============================================

// 1. Find unique
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// 2. Find many
const orders = await prisma.order.findMany({
  where: { userId: session.user.id },
  include: { items: true, payment: true },
  orderBy: { createdAt: 'desc' },
});

// 3. Create
const order = await prisma.order.create({
  data: {
    userId: session.user.id,
    totalAmount: 1000,
    status: 'pending',
  },
});

// 4. Update
const updated = await prisma.order.update({
  where: { id: orderId },
  data: { status: 'completed' },
});

// 5. Delete
await prisma.order.delete({
  where: { id: orderId },
});

// 6. Upsert (update or create)
const profile = await prisma.customerProfile.upsert({
  where: { userId: session.user.id },
  update: { firstName: 'New Name' },
  create: { userId: session.user.id, email: 'user@example.com' },
});

// 7. Complex queries with relations
const orders = await prisma.order.findMany({
  where: {
    userId: session.user.id,
    createdAt: { gte: new Date('2024-01-01') },
  },
  include: {
    items: {
      include: { product: true },
    },
    payment: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// 8. Count
const orderCount = await prisma.order.count({
  where: { userId: session.user.id },
});

// 9. Aggregation
const stats = await prisma.order.aggregate({
  where: { status: 'completed' },
  _sum: { totalAmount: true },
  _avg: { totalAmount: true },
  _count: true,
});
*/
