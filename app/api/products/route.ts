import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - Get all products for the shop
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filter = (url.searchParams.get('filter') || '').toUpperCase();

    // Build Prisma where clause based on filter
    const where: any = {};

    // By default return only published products for the public API
    const includeDrafts = url.searchParams.get('includeDrafts') === 'true';
    if (!includeDrafts) {
      where.published = true;
    }

    if (filter === 'NEW') {
      // Products created in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (filter === 'BEST_SELLERS' || filter === 'BEST SELLERS') {
      // Featured products as best sellers proxy
      where.featured = true;
    }

    // Fetch products from Prisma with optional filter
    let products;
    try {
      products = await prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (err) {
      // If the DB doesn't have the `published` column yet (migration not applied),
      // retry without the `published` constraint so the public API still works.
      console.warn('Initial products query failed, retrying without published filter:', err);
      const whereNoPublished = { ...where };
      if (whereNoPublished.published !== undefined) delete whereNoPublished.published;
      if (whereNoPublished.createdAt && whereNoPublished.createdAt.gte === undefined) {
        // keep createdAt as-is
      }
      products = await prisma.product.findMany({
        where: whereNoPublished,
        orderBy: { createdAt: 'desc' }
      });
    }

    // Transform Prisma products to shop format
    const shopProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image || '/images/placeholder.jpg',
      images: product.image ? [product.image] : ['/images/placeholder.jpg'],
      category: product.category || 'General',
      collection: product.category || 'General', // Map category to collection for shop
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0,
      featured: product.featured || false,
      tags: product.featured ? ['Featured'] : [],
      rating: 4.5, // Default rating for shop display
      sizes: ['S', 'M', 'L', 'XL'], // Default sizes (can be customized per product later)
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' }
      ], // Default colors (can be customized per product later)
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return NextResponse.json(shopProducts);
  } catch (error) {
    console.error('Error fetching products for shop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
