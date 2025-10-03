import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/admin/data';

// GET /api/products - Get all products for the shop
export async function GET(request: NextRequest) {
  try {
    // Fetch products from Supabase
    const { data: products, error } = await supabase
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
    
    // Transform Supabase products to shop format
    const shopProducts = products.map(product => ({
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