import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface HomepageImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

interface CollectionItem {
  id?: string;
  product_id: string;
  display_order: number;
}

interface TransformedSections {
  [key: string]: {
    id: string | null;
    content: Record<string, unknown>;
    status: 'draft' | 'published' | 'scheduled';
    scheduled_publish_at: string | null;
    images: HomepageImage[];
    collection_items: CollectionItem[];
    created_at: string | null;
    updated_at: string | null;
  };
}

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey
  });
}

// Create Supabase client with error handling
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET - Fetch all homepage sections
export async function GET() {
  const startTime = Date.now();
  console.log('[API] GET /api/admin/homepage/sections - Request started');

  try {
    console.log('[API] Fetching homepage sections from database...');

    const supabase = getSupabaseClient();

    // Fetch all homepage sections with their images and collection items
    const { data: sections, error: sectionsError } = await supabase
      .from('homepage_sections')
      .select(`
        *,
        homepage_images(*),
        collection_items(*, products(*))
      `)
      .order('created_at', { ascending: true });

    if (sectionsError) {
      console.error('[API] Database error fetching homepage sections:', {
        error: sectionsError,
        code: sectionsError.code,
        message: sectionsError.message,
        details: sectionsError.details
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch homepage sections',
          details: process.env.NODE_ENV === 'development' ? sectionsError.message : undefined
        },
        { status: 500 }
      );
    }

    console.log('[API] Successfully fetched sections:', {
      count: sections?.length || 0,
      sections: sections?.map(s => ({ type: s.section_type, id: s.id })) || []
    });

    // Defensive programming: handle null/undefined sections
    if (!sections) {
      console.log('[API] No sections found, returning empty result');
      return NextResponse.json({
        success: true,
        sections: {}
      });
    }

    // Transform the data into a more usable format with null checks
    const transformedSections = sections.reduce((acc, section) => {
      // Validate section data
      if (!section || !section.section_type) {
        console.warn('[API] Skipping invalid section:', section);
        return acc;
      }

      try {
        // Safely sort images with null checks
        const sortedImages = Array.isArray(section.homepage_images) 
          ? section.homepage_images
              .filter((img: HomepageImage) => img && typeof img.display_order === 'number')
              .sort((a: HomepageImage, b: HomepageImage) => (a.display_order || 0) - (b.display_order || 0))
          : [];

        // Safely sort collection items with null checks
        const sortedCollectionItems = Array.isArray(section.collection_items)
          ? section.collection_items
              .filter((item: CollectionItem) => item && typeof item.display_order === 'number')
              .sort((a: CollectionItem, b: CollectionItem) => (a.display_order || 0) - (b.display_order || 0))
          : [];

        acc[section.section_type] = {
          id: section.id || null,
          content: section.content || {},
          status: section.status || 'draft',
          scheduled_publish_at: section.scheduled_publish_at || null,
          images: sortedImages,
          collection_items: sortedCollectionItems,
          created_at: section.created_at || null,
          updated_at: section.updated_at || null
        };
      } catch (sectionError) {
        console.error('[API] Error processing section:', {
          sectionType: section.section_type,
          error: sectionError
        });
        // Continue processing other sections
      }

      return acc;
    }, {} as TransformedSections);

    const duration = Date.now() - startTime;
    console.log('[API] Request completed successfully:', {
      duration: `${duration}ms`,
      sectionsCount: Object.keys(transformedSections).length
    });

    return NextResponse.json({
      success: true,
      sections: transformedSections
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API] Unexpected error in GET /api/admin/homepage/sections:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update a homepage section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_type, content, status, scheduled_publish_at, images, collection_items } = body;

    if (!section_type || !content) {
      return NextResponse.json(
        { error: 'section_type and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update the homepage section
    const { data: section, error: sectionError } = await supabase
      .from('homepage_sections')
      .update({
        content,
        status: status || 'draft',
        scheduled_publish_at,
        updated_at: new Date().toISOString()
      })
      .eq('section_type', section_type)
      .select()
      .single();

    if (sectionError) {
      console.error('Error updating homepage section:', sectionError);
      return NextResponse.json(
        { error: 'Failed to update homepage section' },
        { status: 500 }
      );
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images for this section
      await supabase
        .from('homepage_images')
        .delete()
        .eq('section_id', section.id);

      // Insert new images
      if (images.length > 0) {
        const imageData = images.map((img: HomepageImage, index: number) => ({
          section_id: section.id,
          image_url: img.image_url,
          alt_text: img.alt_text || '',
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('homepage_images')
          .insert(imageData);

        if (imagesError) {
          console.error('Error updating homepage images:', imagesError);
          return NextResponse.json(
            { error: 'Failed to update homepage images' },
            { status: 500 }
          );
        }
      }
    }

    // Update collection items if provided
    if (collection_items && Array.isArray(collection_items)) {
      // Delete existing collection items for this section
      await supabase
        .from('collection_items')
        .delete()
        .eq('section_id', section.id);

      // Insert new collection items
      if (collection_items.length > 0) {
        const collectionData = collection_items.map((item: CollectionItem, index: number) => ({
          section_id: section.id,
          product_id: item.product_id,
          display_order: index
        }));

        const { error: collectionError } = await supabase
          .from('collection_items')
          .insert(collectionData);

        if (collectionError) {
          console.error('Error updating collection items:', collectionError);
          return NextResponse.json(
            { error: 'Failed to update collection items' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      section: section
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/homepage/sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new homepage section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_type, content, status, scheduled_publish_at } = body;

    if (!section_type || !content) {
      return NextResponse.json(
        { error: 'section_type and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if section already exists
    const { data: existingSection } = await supabase
      .from('homepage_sections')
      .select('id')
      .eq('section_type', section_type)
      .single();

    if (existingSection) {
      return NextResponse.json(
        { error: 'Section type already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create new homepage section
    const { data: section, error: sectionError } = await supabase
      .from('homepage_sections')
      .insert({
        section_type,
        content,
        status: status || 'draft',
        scheduled_publish_at
      })
      .select()
      .single();

    if (sectionError) {
      console.error('Error creating homepage section:', sectionError);
      return NextResponse.json(
        { error: 'Failed to create homepage section' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      section: section
    });

  } catch (error) {
    console.error('Error in POST /api/admin/homepage/sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}