import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Product, updateProductData } from '@/lib/admin/data';
import { withStackAdminAuthParams } from '@/lib/auth/stack-admin-middleware';

// GET /api/admin/products/[id] - Get product by ID
export const GET = withStackAdminAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {

    // Fetch product from Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching product from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/products/[id] - Update product by ID
export const PUT = withStackAdminAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {

    const body = await request.json();
    
    // Validate data types if provided
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
    }

    if (body.stock !== undefined) {
      if (typeof body.stock !== 'number' || body.stock < 0) {
        return NextResponse.json(
          { error: 'Stock must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (body.sizes !== undefined) {
      if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
        return NextResponse.json(
          { error: 'Sizes must be a non-empty array' },
          { status: 400 }
        );
      }
    }

    if (body.colors !== undefined) {
      if (!Array.isArray(body.colors) || body.colors.length === 0) {
        return NextResponse.json(
          { error: 'Colors must be a non-empty array' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.featured !== undefined) updateData.featured = body.featured;

    // Update product in Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Error updating product in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/products/[id] - Delete product by ID
export const DELETE = withStackAdminAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {

    // Delete product from Supabase
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
});