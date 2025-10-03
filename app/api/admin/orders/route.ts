import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withStackAdminAuth } from '@/lib/auth/stack-admin-middleware';
import { Order } from '@/lib/admin/data';

// GET /api/admin/orders - Get all orders with filtering and pagination
export const GET = withStackAdminAuth(async (request, admin) => {
  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build Supabase query
    let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Sort orders
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
});