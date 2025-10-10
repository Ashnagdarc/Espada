// =====================================================
// PAYMENT INITIALIZATION API ENDPOINT
// =====================================================
// This endpoint initializes a Paystack payment transaction
// and creates a payment record in the database
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paystackService } from '@/lib/paystack';

interface InitializePaymentRequest {
  order_id: string;
  customer_email: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializePaymentRequest = await request.json();
    
    // Validate request
    if (!body.order_id || !body.customer_email || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: order_id, customer_email, amount'
      }, { status: 400 });
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    // Verify order exists and belongs to customer
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        customer_id,
        order_number,
        total_amount,
        payment_status,
        customer_profiles!inner(email)
      `)
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      console.error('Order lookup error:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Verify customer email matches (handle relation array)
    const profileEmail = Array.isArray(order.customer_profiles)
      ? order.customer_profiles[0]?.email
      : (order as any).customer_profiles?.email;
    if (!profileEmail || profileEmail !== body.customer_email) {
      return NextResponse.json({
        success: false,
        error: 'Customer email does not match order'
      }, { status: 403 });
    }

    // Check if order is already paid
    if (order.payment_status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Order already paid'
      }, { status: 400 });
    }

    // Check if there's already a pending payment for this order
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status, authorization_url')
      .eq('order_id', body.order_id)
      .eq('status', 'pending')
      .single();

    // If there's already a pending payment, return its details
    if (existingPayment) {
      return NextResponse.json({
        success: true,
        data: {
          authorization_url: existingPayment.authorization_url,
          message: 'Using existing pending payment'
        }
      });
    }

    // Generate unique reference
    const reference = paystackService.generateReference();
    
    // Convert amount to kobo (Paystack expects amounts in kobo for NGN)
    const amountInKobo = paystackService.convertToKobo(body.amount);

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeTransaction({
      email: body.customer_email,
      amount: amountInKobo,
      reference: reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        order_id: body.order_id,
        customer_id: order.customer_id,
        order_number: order.order_number
      }
    });

    if (!paystackResponse.status) {
      console.error('Paystack initialization failed:', paystackResponse);
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize payment with Paystack'
      }, { status: 500 });
    }

    // Save payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: body.order_id,
        paystack_reference: reference,
        paystack_access_code: paystackResponse.data.access_code,
        authorization_url: paystackResponse.data.authorization_url,
        amount: body.amount,
        currency: body.currency || 'NGN',
        status: 'pending'
      });

    if (paymentError) {
      console.error('Error saving payment record:', paymentError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save payment record'
      }, { status: 500 });
    }

    // Update order with Paystack reference
    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({
        paystack_reference: reference,
        payment_method: 'paystack',
        payment_gateway: 'paystack',
        updated_at: new Date().toISOString()
      })
      .eq('id', body.order_id);

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError);
      // Don't fail the request if order update fails, payment record is more important
    }

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: reference,
        amount: body.amount,
        currency: body.currency || 'NGN'
      }
    });

  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}