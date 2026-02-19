import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/customers/[id] - Fetch specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void request;
    console.log('🔍 Admin customer details API called');
    const { id } = await params;

    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            orders: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                currency: true,
                createdAt: true,
                items: {
                  select: {
                    id: true,
                    quantity: true,
                    price: true,
                    product: {
                      select: {
                        id: true,
                        name: true,
                        image: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Transform response to match expected shape
    const response = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode,
      country: customer.country,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      orders: customer.user?.orders?.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image
          }
        }))
      })) || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Customer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Admin customer update API called');
    const { id } = await params;

    const customerData = await request.json();

    // First verify customer exists
    const existingCustomer = await prisma.customerProfile.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update customer profile
    const customer = await prisma.customerProfile.update({
      where: { id },
      data: {
        email: customerData.email || existingCustomer.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postalCode: customerData.postalCode,
        country: customerData.country
      }
    });

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode,
      country: customer.country,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Customer update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void request;
    console.log('🔍 Admin customer delete API called');
    const { id } = await params;

    // Verify customer exists
    const customer = await prisma.customerProfile.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete customer profile
    await prisma.customerProfile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}