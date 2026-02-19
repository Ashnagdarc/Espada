import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

interface HomepageImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface CollectionItem {
  id: string;
  product_id: string;
  display_order: number;
  products: Product;
}

interface HomepageSection {
  id: string;
  content: Record<string, unknown>;
  status: string;
  images: HomepageImage[];
  collection_items: CollectionItem[];
  created_at: string;
  updated_at: string;
}

interface HomepageData {
  hero: HomepageSection | null;
  new_this_week: HomepageSection | null;
  xiv_collections: HomepageSection | null;
  approach: HomepageSection | null;
}

export async function GET() {
  const buildFallbackData = (): HomepageData => {
      const now = new Date().toISOString();
      return {
        hero: {
          id: 'default-hero',
          content: {
            title: 'Elevate Your Everyday Style',
            subtitle: 'Timeless essentials made for comfort and confidence.'
          },
          status: 'published',
          images: [
            { id: 'img-hero-1', image_url: '/images/mg0ujxhg-rt8uqe1.png', alt_text: 'Collection item', display_order: 1 },
            { id: 'img-hero-2', image_url: '/images/mg0ujxhg-glpb31v.png', alt_text: 'Collection item', display_order: 2 }
          ],
          collection_items: [],
          created_at: now,
          updated_at: now
        },
        new_this_week: {
          id: 'default-new',
          content: { title: 'New This Week' },
          status: 'published',
          images: [],
          collection_items: [],
          created_at: now,
          updated_at: now
        },
        xiv_collections: {
          id: 'default-xiv',
          content: { title: 'XIV Collections' },
          status: 'published',
          images: [],
          collection_items: [],
          created_at: now,
          updated_at: now
        },
        approach: {
          id: 'default-approach',
          content: {
            title: 'Our Approach',
            description:
              'We believe in creating timeless pieces that transcend seasonal trends. Our approach to fashion is rooted in sustainability, quality craftsmanship, and innovative design.'
          },
          status: 'published',
          images: [
            { id: 'img-ap-1', image_url: '/images/mg0ujxhg-rt8uqe1.png', alt_text: 'Sustainable Materials', display_order: 1 },
            { id: 'img-ap-2', image_url: '/images/mg0ujxhg-glpb31v.png', alt_text: 'Quality Craftsmanship', display_order: 2 },
            { id: 'img-ap-3', image_url: '/images/mg0ujxhg-rt8uqe1.png', alt_text: 'Innovative Design', display_order: 3 }
          ],
          collection_items: [],
          created_at: now,
          updated_at: now
        }
      } as any;
    };

  try {
    // Check cache first
    const cachedData = cache.get<HomepageData>(CACHE_KEYS.HOMEPAGE);
    if (cachedData) {
      console.log('📦 Serving homepage data from cache');
      const headers = new Headers({
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'HIT',
      });
      return NextResponse.json({
        success: true,
        data: cachedData,
      }, { headers });
    }

    console.log('🔄 Fetching fresh homepage data from database');

    // Add cache headers for better performance
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      'X-Cache': 'MISS',
    });

    // Fetch homepage sections with related images and collection items
    const sections = await prisma.homepageSection.findMany({
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        },
        collectionItems: {
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Fetch products for collection items
    const productIds = sections
      .flatMap(section => section.collectionItems)
      .map(item => item.productId)
      .filter((id): id is string => id !== null);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    // Transform the data into the format expected by the frontend
    const homepageData: HomepageData = {
      hero: null,
      new_this_week: null,
      xiv_collections: null,
      approach: null,
    };

    sections.forEach((section) => {
      // Transform images to match frontend expectations (snake_case)
      const transformedImages = section.images.map(img => ({
        id: img.id,
        image_url: img.url,
        alt_text: img.caption || '',
        display_order: img.position
      }));

      // Transform collection items with product data
      const transformedCollections = section.collectionItems.map(item => {
        const product = item.productId ? productsMap.get(item.productId) : null;
        
        return {
          id: item.id,
          product_id: item.productId || '',
          display_order: item.position,
          products: product ? {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.image ? [product.image] : [],
            category: product.category || ''
          } : {
            id: '',
            name: item.title || 'Product',
            price: 0,
            images: [],
            category: ''
          }
        };
      });

      // Parse content from JSON string if needed
      let parsedContent: Record<string, unknown> = {};
      if (section.content) {
        try {
          parsedContent = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content as Record<string, unknown>;
        } catch {
          parsedContent = { title: section.title };
        }
      } else {
        parsedContent = { title: section.title };
      }

      const sectionData = {
        id: section.id,
        content: parsedContent,
        status: 'published', // Prisma schema doesn't have status, default to published
        images: transformedImages,
        collection_items: transformedCollections,
        created_at: section.createdAt.toISOString(),
        updated_at: section.updatedAt.toISOString(),
      };

      // Assign to the appropriate section type
      switch (section.type) {
        case 'hero':
          homepageData.hero = sectionData;
          break;
        case 'new_this_week':
          homepageData.new_this_week = sectionData;
          break;
        case 'xiv_collections':
          homepageData.xiv_collections = sectionData;
          break;
        case 'approach':
          homepageData.approach = sectionData;
          break;
      }
    });

    // Cache the result for future requests
    cache.set(CACHE_KEYS.HOMEPAGE, homepageData, CACHE_TTL.HOMEPAGE);
    console.log('💾 Cached homepage data for', CACHE_TTL.HOMEPAGE / 1000, 'seconds');

    return NextResponse.json({
      success: true,
      data: homepageData,
    }, { headers });

  } catch (error) {
    console.error('Error in homepage API:', error);
    const headersCatch = new Headers({
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Cache': 'BYPASS',
      'X-Fallback': 'true'
    });
    const fallbackData: HomepageData = buildFallbackData();
    cache.set(CACHE_KEYS.HOMEPAGE, fallbackData, CACHE_TTL.HOMEPAGE);
    return NextResponse.json({ success: true, data: fallbackData }, { headers: headersCatch });
  }
}