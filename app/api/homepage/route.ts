import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
  section_type: string;
  content: any;
  status: string;
  created_at: string;
  updated_at: string;
  homepage_images?: HomepageImage[];
  collection_items?: CollectionItem[];
}

interface HomepageData {
  hero: any;
  new_this_week: any;
  xiv_collections: any;
  approach: any;
}

export async function GET(request: NextRequest) {
  try {

    // Fetch all published homepage sections with their images and collection items
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('homepage_sections')
      .select(`
        id,
        section_type,
        content,
        status,
        created_at,
        updated_at,
        homepage_images (
          id,
          image_url,
          alt_text,
          display_order
        ),
        collection_items (
          id,
          product_id,
          display_order,
          products (
            id,
            name,
            price,
            images,
            category
          )
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching homepage sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch homepage data' },
        { status: 500 }
      );
    }

    // Transform the data into a more usable format
    const homepageData: HomepageData = {
      hero: null,
      new_this_week: null,
      xiv_collections: null,
      approach: null,
    };

    sections?.forEach((section: HomepageSection) => {
      // Sort images by display_order
      const sortedImages = section.homepage_images?.sort(
        (a, b) => a.display_order - b.display_order
      ) || [];

      // Sort collection items by display_order and include product data
      const sortedCollectionItems = section.collection_items?.sort(
        (a, b) => a.display_order - b.display_order
      ) || [];

      const sectionData = {
        id: section.id,
        content: section.content,
        status: section.status,
        images: sortedImages,
        collection_items: sortedCollectionItems,
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

    return NextResponse.json({
      success: true,
      data: homepageData,
    });

  } catch (error) {
    console.error('Error in homepage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}