import { NextRequest, NextResponse } from 'next/server';
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

interface HomepageData {
  hero: Record<string, unknown>;
  new_this_week: Record<string, unknown>;
  xiv_collections: Record<string, unknown>;
  approach: Record<string, unknown>;
}

export async function GET() {
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

    // Optimize: Fetch sections first, then fetch related data separately to reduce join complexity
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('homepage_sections')
      .select('id, section_type, content, status, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching homepage sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch homepage data' },
        { status: 500 }
      );
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}