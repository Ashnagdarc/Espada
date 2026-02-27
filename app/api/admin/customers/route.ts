import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type AdminCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// GET /api/admin/customers - Fetch all customers with pagination and filtering
export async function GET(request: Request) {
  try {
    console.log('🔍 Admin customers API called');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (safePage - 1) * safeLimit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    // Build order by
    const direction = sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy =
      sortBy === 'email'
        ? { email: direction as 'asc' | 'desc' }
        : sortBy === 'firstName'
        ? { firstName: direction as 'asc' | 'desc' }
        : sortBy === 'lastName'
        ? { lastName: direction as 'asc' | 'desc' }
        : { createdAt: direction as 'asc' | 'desc' };

    const [customers, count] = await Promise.all([
      prisma.customerProfile.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      }),
      prisma.customerProfile.count({ where })
    ]);

    const transformedCustomers = (customers as AdminCustomer[]).map((customer: AdminCustomer) => ({
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
    }));

    return NextResponse.json({
      customers: transformedCustomers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: count,
        totalPages: Math.ceil(count / safeLimit)
      }
    });
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/customers - Create new customer
export async function POST(request: Request) {
  try {
    console.log('🔍 Admin customer creation API called');

    const customerData = await request.json();

    // Create user first if email doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: customerData.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerData.email,
          name: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
          role: 'customer'
        }
      });
    }

    // Create or update customer profile
    const customer = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postalCode: customerData.postalCode,
        country: customerData.country
      },
      create: {
        userId: user.id,
        email: customerData.email,
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
    console.error('Customer creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
