import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/auth-middleware';
import { Order } from '@/lib/admin/data';

// GET /api/admin/orders - Get all orders with filtering and pagination
export const GET = withAuth(async (request, admin) => {
  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build Supabase query with customer information
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer_profiles!orders_customer_id_fkey (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Sort orders
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: ordersData, error, count } = await query;

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform the data to include customer information
    const orders = ordersData?.map(order => ({
      ...order,
      customer_name: order.customer_profiles 
        ? `${order.customer_profiles.first_name} ${order.customer_profiles.last_name}`.trim()
        : 'Unknown Customer',
      customer_email: order.customer_profiles?.email || 'No email'
    })) || [];

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