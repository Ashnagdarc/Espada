import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withStackAdminAuth } from '@/lib/auth/stack-admin-middleware';
import { Product, createProductData } from '@/lib/admin/data';

// GET /api/admin/products - Get all products
export const GET = withStackAdminAuth(async (request, admin) => {
  try {
    // Fetch products from Supabase
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

// POST /api/admin/products - Create a new product
export const POST = withStackAdminAuth(async (request, admin) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
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

    if (typeof body.stock !== 'number' || body.stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Insert product into Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        sizes: body.sizes || [],
        colors: body.colors || [],
        images: body.images || [],
        stock: body.stock,
        featured: body.featured || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
});