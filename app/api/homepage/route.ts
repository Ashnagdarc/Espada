import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Optimize: Fetch sections first, then fetch related data separately to reduce join complexity
    // Pre-check env to avoid hard failures in local/dev
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ Supabase env missing; serving fallback homepage data');
      const headers = new Headers({
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'BYPASS',
        'X-Fallback': 'true'
      });
      const fallback = buildFallbackData();
      cache.set(CACHE_KEYS.HOMEPAGE, fallback, CACHE_TTL.HOMEPAGE);
      return NextResponse.json({ success: true, data: fallback }, { headers });
    }

    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('homepage_sections')
      .select('id, section_type, content, status, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching homepage sections:', sectionsError);
      const headersErr = new Headers({
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'BYPASS',
        'X-Fallback': 'true'
      });
      const fallback = buildFallbackData();
      cache.set(CACHE_KEYS.HOMEPAGE, fallback, CACHE_TTL.HOMEPAGE);
      return NextResponse.json({ success: true, data: fallback }, { headers: headersErr });
    }

    // Fetch images and collection items separately for better performance
    const sectionIds = sections?.map(s => s.id) || [];
    
    const [imagesResult, collectionsResult] = await Promise.all([
      // Fetch all images for these sections
      supabaseAdmin
        .from('homepage_images')
        .select('id, section_id, image_url, alt_text, display_order')
        .in('section_id', sectionIds)
        .order('display_order', { ascending: true }),
      
      // Fetch collection items with products
      supabaseAdmin
        .from('collection_items')
        .select(`
          id,
          section_id,
          product_id,
          display_order,
          products (
            id,
            name,
            price,
            images,
            category
          )
        `)
        .in('section_id', sectionIds)
        .order('display_order', { ascending: true })
    ]);

    if (imagesResult.error) {
      console.error('Error fetching homepage images:', imagesResult.error);
    }

    if (collectionsResult.error) {
      console.error('Error fetching collection items:', collectionsResult.error);
    }

    // Group images and collections by section_id for efficient lookup
    const imagesBySection = new Map<string, any[]>();
    const collectionsBySection = new Map<string, any[]>();

    imagesResult.data?.forEach(image => {
      if (!imagesBySection.has(image.section_id)) {
        imagesBySection.set(image.section_id, []);
      }
      imagesBySection.get(image.section_id)!.push(image);
    });

    collectionsResult.data?.forEach(collection => {
      if (!collectionsBySection.has(collection.section_id)) {
        collectionsBySection.set(collection.section_id, []);
      }
      collectionsBySection.get(collection.section_id)!.push(collection);
    });

    // Transform the data into a more usable format
    const homepageData: HomepageData = {
      hero: null,
      new_this_week: null,
      xiv_collections: null,
      approach: null,
    };

    sections?.forEach((section: any) => {
      const sectionImages = imagesBySection.get(section.id) || [];
      const sectionCollections = collectionsBySection.get(section.id) || [];

      const sectionData = {
        id: section.id,
        content: section.content,
        status: section.status,
        images: sectionImages,
        collection_items: sectionCollections,
        created_at: section.created_at,
        updated_at: section.updated_at,
      };

      // Assign to the appropriate section type
      switch (section.section_type) {
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