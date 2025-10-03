import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Order, updateOrderData } from '@/lib/admin/data';
import { withStackAdminAuthParams } from '@/lib/auth/stack-admin-middleware';

// PUT /api/admin/orders/[id]/status - Update order status
export const PUT = withStackAdminAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {

    const { status } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // First, get the current order to validate status transition
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching order from Supabase:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Final state
      'cancelled': [] // Final state
    };

    if (!validTransitions[currentOrder.status].includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentOrder.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update order status in Supabase
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order status in Supabase:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
});

// Business logic for valid status transitions
function validateStatusTransition(currentStatus: Order['status'], newStatus: Order['status']): boolean {
  // Define valid transitions
  const validTransitions: Record<Order['status'], Order['status'][]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [], // Final state
    cancelled: [] // Final state
  };

  // Allow same status (no change)
  if (currentStatus === newStatus) {
    return true;
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}