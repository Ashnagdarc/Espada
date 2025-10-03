import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Order } from '@/lib/admin/data';
import { withStackAdminAuthParams } from '@/lib/auth/stack-admin-middleware';

// GET /api/admin/orders/[id] - Get order by ID
export const GET = withStackAdminAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {

    // Fetch order from Supabase
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching order from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
});