import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/products/[id] - Get product by ID for the shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Fetch product from Supabase
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Transform Supabase product to shop format
    const shopProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      image: product.images?.[0] || '/images/placeholder.jpg',
      images: product.images || ['/images/placeholder.jpg'],
      category: product.category,
      collection: product.category, // Map category to collection for shop
      stock: product.stock,
      inStock: product.stock > 0,
      featured: product.featured || false,
      tags: product.featured ? ['Featured'] : [],
      rating: 4.5, // Default rating for shop display
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black', 'White'],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
    
    return NextResponse.json(shopProduct);
  } catch (error) {
    console.error('Error fetching product for shop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}