// =====================================================
// PAYSTACK WEBHOOK HANDLER
// =====================================================
// This endpoint handles webhook notifications from Paystack
// for real-time payment status updates
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paystackService } from '@/lib/paystack';

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
    };
    metadata?: {
      order_id?: string;
      customer_id?: string;
      order_number?: string;
      [key: string]: any;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    if (!signature) {
      console.error('Webhook: No signature provided');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    try {
      const isValidSignature = paystackService.validateWebhookSignature(body, signature);
      if (!isValidSignature) {
        console.error('Webhook: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } catch (error) {
      console.error('Webhook: Signature validation error:', error);
      return NextResponse.json({ error: 'Signature validation failed' }, { status: 400 });
    }

    // Parse the webhook event
    let event: PaystackWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('Webhook: Invalid JSON payload');
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    console.log(`Webhook: Received ${event.event} event for reference ${event.data.reference}`);

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      
      case 'charge.abandoned':
        await handleChargeAbandoned(event.data);
        break;
      
      default:
        console.log(`Webhook: Unhandled event type: ${event.event}`);
        break;
    }

    return NextResponse.json({ 
      received: true,
      event: event.event,
      reference: event.data.reference
    });

  } catch (error) {
    console.error('Webhook: Processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle successful charge webhook
 */
async function handleChargeSuccess(data: PaystackWebhookEvent['data']) {
  try {
    const { reference, status, gateway_response, paid_at, amount } = data;

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, order_id, status')
      .eq('paystack_reference', reference)
      .single();

    if (paymentError || !payment) {
      console.error(`Webhook: Payment record not found for reference ${reference}:`, paymentError);
      return;
    }

    // Skip if already processed
    if (payment.status === 'success') {
      console.log(`Webhook: Payment ${reference} already marked as successful`);
      return;
    }

    // Update payment status
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        gateway_response,
        paid_at: new Date(paid_at).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference);

    if (updatePaymentError) {
      console.error(`Webhook: Error updating payment ${reference}:`, updatePaymentError);
      return;
    }

    // Update order status
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id);

    if (updateOrderError) {
      console.error(`Webhook: Error updating order for payment ${reference}:`, updateOrderError);
    }

    console.log(`Webhook: Successfully processed charge.success for ${reference}`);

    // TODO: Add additional post-payment processing here:
    // - Send confirmation email
    // - Update inventory
    // - Trigger fulfillment
    // - Send admin notification

  } catch (error) {
    console.error('Webhook: Error handling charge.success:', error);
  }
}

/**
 * Handle failed charge webhook
 */
async function handleChargeFailed(data: PaystackWebhookEvent['data']) {
  try {
    const { reference, gateway_response } = data;

    // Update payment status
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed',
        gateway_response,
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference);

    if (updatePaymentError) {
      console.error(`Webhook: Error updating failed payment ${reference}:`, updatePaymentError);
      return;
    }

    console.log(`Webhook: Successfully processed charge.failed for ${reference}`);

    // TODO: Add failure handling logic:
    // - Send failure notification to customer
    // - Log for admin review
    // - Trigger retry logic if applicable

  } catch (error) {
    console.error('Webhook: Error handling charge.failed:', error);
  }
}

/**
 * Handle abandoned charge webhook
 */
async function handleChargeAbandoned(data: PaystackWebhookEvent['data']) {
  try {
    const { reference } = data;

    // Update payment status
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'abandoned',
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference);

    if (updatePaymentError) {
      console.error(`Webhook: Error updating abandoned payment ${reference}:`, updatePaymentError);
      return;
    }

    console.log(`Webhook: Successfully processed charge.abandoned for ${reference}`);

    // TODO: Add abandonment handling logic:
    // - Send cart recovery email
    // - Track abandonment analytics
    // - Trigger remarketing campaigns

  } catch (error) {
    console.error('Webhook: Error handling charge.abandoned:', error);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}