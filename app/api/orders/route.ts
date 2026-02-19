import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  color?: string;
  size?: string;
}

interface CreateOrderRequest {
  items: OrderItemInput[];
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  notes?: string;
}

function safeParseAddress(value?: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: CreateOrderRequest = await request.json();

    if (!body.items || body.items.length === 0 || !body.total_amount || !body.shipping_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: items, total_amount, shipping_address' },
        { status: 400 }
      );
    }

    const productIds = body.items.map((item) => item.product_id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer available. Please refresh your cart.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'pending',
        totalAmount: body.total_amount,
        currency: 'NGN',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify(body.shipping_address),
      },
    });

    const orderItems = body.items.map((item) => ({
      orderId: order.id,
      productId: item.product_id,
      quantity: item.quantity,
      price: item.unit_price,
    }));

    await prisma.orderItem.createMany({ data: orderItems });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.id,
        status: order.status,
        total_amount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve orders for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformedOrders = orders.map((order) => {
      const shippingAddress = safeParseAddress(order.shippingAddress);

      return {
        id: order.id,
        order_number: order.id,
        status: order.status,
        total_amount: order.totalAmount,
        currency: order.currency,
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
        payment_method: order.payment?.paymentMethod || 'unknown',
        payment_status: order.paymentStatus,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        notes: null,
        items: order.items.map((item) => ({
          id: item.id,
          product_id: item.productId,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: null,
          size: null,
          image_url: item.product.image || null,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedOrders,
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
