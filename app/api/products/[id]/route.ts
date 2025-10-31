import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to get color hex values
function getColorValue(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#808080',
    'Grey': '#808080',
    'Brown': '#8B4513',
    'Blue': '#0000FF',
    'Red': '#FF0000',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Orange': '#FFA500',
    'Beige': '#F5F5DC',
    'Navy': '#000080',
    'Maroon': '#800000',
  };
  return colorMap[colorName] || '#000000';
}

// GET /api/products/[id] - Get product by ID for the shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;
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
      stock: product.stock_quantity || 0, // Fix: map stock_quantity to stock
      inStock: (product.stock_quantity || 0) > 0,
      featured: product.featured || false,
      tags: product.featured ? ['Featured'] : [],
      rating: 4.5, // Default rating for shop display
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(product.colors)
        ? product.colors.map((color: unknown) => {
            if (typeof color === 'string') {
              return { name: color, value: getColorValue(color) };
            }

            if (
              typeof color === 'object' &&
              color !== null &&
              'name' in color &&
              'value' in color &&
              typeof (color as { name: unknown }).name === 'string' &&
              typeof (color as { value: unknown }).value === 'string'
            ) {
              const { name, value } = color as { name: string; value: string };
              return { name, value };
            }

            const fallbackName = String(color);
            return { name: fallbackName, value: getColorValue(fallbackName) };
          })
        : [{ name: 'Black', value: '#000000' }, { name: 'White', value: '#FFFFFF' }],
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