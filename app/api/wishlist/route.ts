import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch wishlist for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const productIds = wishlist.map((item) => item.productId);
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
        })
      : [];

    const productMap = new Map(products.map((product) => [product.id, product]));

    const transformed = wishlist.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt.toISOString(),
      product: productMap.get(item.productId) || null,
    }));

    return NextResponse.json({
      success: true,
      wishlist: transformed,
    });
  } catch (error) {
    console.error('Error in GET /api/wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = body?.product_id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'product_id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, productId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Item already in wishlist' },
        { status: 409 }
      );
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = body?.product_id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'product_id is required' },
        { status: 400 }
      );
    }

    await prisma.wishlist.deleteMany({
      where: { userId: session.user.id, productId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
