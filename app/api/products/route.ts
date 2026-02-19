import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to get color hex values
function getColorValue(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    // Basic colors
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#808080',
    'Grey': '#808080',

    // Earth tones
    'Brown': '#8B4513',
    'Tan': '#D2B48C',
    'Beige': '#F5F5DC',
    'Khaki': '#F0E68C',
    'Olive': '#808000',
    'Sand': '#C2B280',
    'Cream': '#FFFDD0',
    'Ivory': '#FFFFF0',

    // Blues
    'Blue': '#0066CC',
    'Navy': '#000080',
    'Royal Blue': '#4169E1',
    'Sky Blue': '#87CEEB',
    'Teal': '#008080',
    'Turquoise': '#40E0D0',
    'Cyan': '#00FFFF',
    'Steel Blue': '#4682B4',
    'Powder Blue': '#B0E0E6',

    // Reds
    'Red': '#DC2626',
    'Crimson': '#DC143C',
    'Burgundy': '#800020',
    'Maroon': '#800000',
    'Cherry': '#DE3163',
    'Rose': '#FF007F',
    'Coral': '#FF7F50',
    'Salmon': '#FA8072',

    // Greens
    'Green': '#16A34A',
    'Forest Green': '#228B22',
    'Lime': '#32CD32',
    'Mint': '#98FB98',
    'Sage': '#9CAF88',
    'Emerald': '#50C878',
    'Jade': '#00A86B',
    'Pine': '#01796F',

    // Purples
    'Purple': '#7C3AED',
    'Violet': '#8A2BE2',
    'Lavender': '#E6E6FA',
    'Plum': '#DDA0DD',
    'Indigo': '#4B0082',
    'Magenta': '#FF00FF',
    'Orchid': '#DA70D6',

    // Yellows/Oranges
    'Yellow': '#EAB308',
    'Gold': '#FFD700',
    'Orange': '#EA580C',
    'Amber': '#FFBF00',
    'Peach': '#FFCBA4',
    'Apricot': '#FBCEB1',
    'Mustard': '#FFDB58',
    'Honey': '#FFC30B',

    // Pinks
    'Pink': '#EC4899',
    'Hot Pink': '#FF69B4',
    'Blush': '#DE5D83',
    'Fuchsia': '#FF00FF',
    'Mauve': '#E0B0FF',
    'Dusty Rose': '#DCAE96',

    // Neutrals
    'Charcoal': '#36454F',
    'Slate': '#708090',
    'Silver': '#C0C0C0',
    'Platinum': '#E5E4E2',
    'Pearl': '#F8F6F0',
    'Ash': '#B2BEB5',
    'Stone': '#928E85',
    'Taupe': '#483C32',

    // Modern colors
    'Mint Green': '#00FF7F',
    'Electric Blue': '#7DF9FF',
    'Neon Pink': '#FF6EC7',
    'Lime Green': '#32CD32',
    'Sunset Orange': '#FF8C69',
    'Deep Purple': '#663399',
    'Forest': '#355E3B',
    'Ocean': '#006994',
  };
  return colorMap[colorName] || '#000000';
}

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