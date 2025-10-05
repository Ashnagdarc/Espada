import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuthParams } from '@/lib/auth-middleware';

// GET /api/admin/customers/[id] - Fetch specific customer
export const GET = withAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: { id: string } }
) => {
  try {
    console.log('🔍 Admin customer details API called by:', admin.email);

    const { data: customer, error } = await supabaseAdmin
      .from('customer_profiles')
      .select(`
        *,
        customer_addresses(*),
        orders(
          id,
          order_number,
          status,
          total_amount,
          currency,
          created_at,
          order_items(
            id,
            product_id,
            quantity,
            price,
            products(name, image_url)
          )
        )
      `)
      .eq('id', params.id)
      .single();
      
    if (error) {
      console.error('Error fetching customer:', error);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// PUT /api/admin/customers/[id] - Update customer
export const PUT = withAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: { id: string } }
) => {
  try {
    console.log('🔍 Admin customer update API called by:', admin.email);

    const customerData = await request.json();

    const { data: customer, error } = await supabaseAdmin
      .from('customer_profiles')
      .update({
        email: customerData.email,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postal_code: customerData.postalCode,
        country: customerData.country,
        date_of_birth: customerData.dateOfBirth,
        gender: customerData.gender,
        status: customerData.status,
        preferences: customerData.preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE /api/admin/customers/[id] - Delete customer
export const DELETE = withAuthParams(async (
  request: NextRequest,
  admin,
  { params }: { params: { id: string } }
) => {
  try {
    console.log('🔍 Admin customer delete API called by:', admin.email);

    // Soft delete by updating status
    const { error } = await supabaseAdmin
      .from('customer_profiles')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);
      
    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});