import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Interface for order creation
interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  color?: string;
  size?: string;
}

interface CreateOrderRequest {
  customer_id: string;
  items: OrderItem[];
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  notes?: string;
}

interface OrderItemWithProduct {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  color?: string | null;
  size?: string | null;
  products: {
    id: string;
    name: string;
    images: string[] | null;
  } | null;
}

interface OrderRecord extends Record<string, unknown> {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItemWithProduct[];
}

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();
    
    // Validate required fields
    if (!body.customer_id || !body.items || body.items.length === 0 || !body.total_amount || !body.shipping_address) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customer_id, items, total_amount, shipping_address'
      }, { status: 400 });
    }

    // Validate customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .eq('id', body.customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 });
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure order number is unique
    while (attempts < maxAttempts) {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single();

      if (!existingOrder) break;
      
      orderNumber = generateOrderNumber();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate unique order number'
      }, { status: 500 });
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: body.customer_id,
        order_number: orderNumber,
        status: 'pending',
        total_amount: body.total_amount,
        currency: 'USD',
        shipping_address: body.shipping_address,
        billing_address: body.billing_address || body.shipping_address,
        payment_status: 'pending',
        payment_method: body.payment_method,
        notes: body.notes || ''
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create order'
      }, { status: 500 });
    }

    // Create order items
    const orderItems = body.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      color: item.color,
      size: item.size
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create order items'
      }, { status: 500 });
    }

    // Update product stock quantities (retrieve current stock then decrement)
    for (const item of body.items) {
      const { data: productStock, error: fetchStockError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (fetchStockError) {
        console.error('Error fetching stock for product:', item.product_id, fetchStockError);
        continue;
      }

      const currentStock = Number(productStock?.stock_quantity ?? 0);
      const newStock = Math.max(0, currentStock - Number(item.quantity));

      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id);

      if (stockError) {
        console.error('Error updating stock for product:', item.product_id, stockError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        order_number: orderNumber,
        status: order.status,
        total_amount: order.total_amount
      }
    });

  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET - Retrieve orders for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'customer_id parameter is required'
      }, { status: 400 });
    }

    // Get orders with order items and product details
    const { data: ordersData, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          color,
          size,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch orders'
      }, { status: 500 });
    }

    // Transform the data to include product details in order items
    const orders = (ordersData ?? []) as OrderRecord[];

    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.order_items.map(item => ({
        id: item.id,
        product_id: item.product_id ?? item.products?.id ?? null,
        product_name: item.products?.name ?? 'Unknown Product',
        quantity: item.quantity,
        price: item.unit_price,
        color: item.color,
        size: item.size,
        image_url: item.products?.images?.[0] ?? null
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders
    });

  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}