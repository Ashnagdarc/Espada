import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function safeParseAddress(value?: string | null) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

// GET /api/admin/orders - Get all orders with filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit
    const skip = (safePage - 1) * safeLimit

    const where = status && status !== 'all' ? { status } : undefined
    const orderBy = sortBy === 'total_amount'
      ? { totalAmount: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' }

    const [ordersData, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          user: { include: { profile: true } },
          payment: true
        }
      }),
      prisma.order.count({ where })
    ])

    const orders = ordersData.map((order) => {
      const profile = order.user?.profile
      const customerName = profile
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email
        : order.user?.email || 'Unknown Customer'

      return {
        id: order.id,
        customer_id: order.userId,
        order_number: order.id,
        status: order.status,
        total_amount: order.totalAmount,
        currency: order.currency,
        shipping_address: safeParseAddress(order.shippingAddress),
        billing_address: safeParseAddress(order.shippingAddress),
        payment_status: order.paymentStatus,
        payment_method: order.payment?.paymentMethod || 'unknown',
        notes: null,
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
        customer_name: customerName,
        customer_email: profile?.email || order.user?.email || 'No email'
      }
    })

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / safeLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}