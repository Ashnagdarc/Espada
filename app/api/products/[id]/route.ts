import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[id] - Get product by ID for the shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;
  const { id } = await params;
  try {
    // Fetch product from Prisma
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Transform Prisma product to shop format
    const shopProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image || '/images/placeholder.jpg',
      images: product.image ? [product.image] : ['/images/placeholder.jpg'],
      category: product.category || 'General',
      collection: product.category || 'General',
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0,
      featured: product.featured || false,
      tags: product.featured ? ['Featured'] : [],
      rating: 4.5, // Default rating for shop display
      sizes: ['S', 'M', 'L', 'XL'], // Default sizes
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' }
      ], // Default colors
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    return NextResponse.json(shopProduct);
  } catch (error) {
    console.error('Error fetching product for shop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
