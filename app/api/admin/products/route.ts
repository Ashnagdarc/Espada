import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/auth-middleware';
import { ProductFormData } from '@/lib/types/api';

// GET /api/admin/products - Get all products
export const GET = withAuth(async (request, admin) => {
  try {
    console.log('🔍 Admin products API called by:', admin.email);
    
    // Fetch products from Supabase
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });



    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      );
    }

    // Transform database response to match frontend Product interface
    const transformedProducts = (products || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      stock: product.stock_quantity || 0, // Map stock_quantity to stock
      featured: product.featured || false,
      createdAt: product.created_at, // Map created_at to createdAt
      updatedAt: product.updated_at  // Map updated_at to updatedAt
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

// POST /api/admin/products - Create a new product
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate data types
    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Map form status to database status
    let dbStatus = 'active';
    if (body.status === 'draft') {
      dbStatus = 'inactive';
    } else if (body.status === 'published') {
      dbStatus = 'active';
    }

    // Prepare product data for database
    const productData: Partial<ProductFormData> & { 
      stock_quantity: number; 
      status: string; 
      original_price?: number; 
      sku?: string; 
    } = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      sizes: body.sizes || [],
      colors: body.colors || [],
      images: body.images || [],
      stock_quantity: body.stock || 0,
      featured: body.featured || false,
      status: dbStatus
    };

    // Add optional fields if they exist
    if (body.sku) productData.sku = body.sku;
    if (body.compareAtPrice) productData.original_price = body.compareAtPrice;

    // Insert product into Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});