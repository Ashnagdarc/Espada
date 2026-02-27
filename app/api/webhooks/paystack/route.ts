// =====================================================
// PAYSTACK WEBHOOK HANDLER
// =====================================================
// This endpoint handles webhook notifications from Paystack
// for real-time payment status updates
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
      user_id?: string;
      [key: string]: unknown;
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
    } catch {
      console.error('Webhook: Signature validation error');
      return NextResponse.json({ error: 'Signature validation failed' }, { status: 400 });
    }

    // Parse the webhook event
    let event: PaystackWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch {
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
    const { reference, gateway_response, paid_at } = data;

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { reference }
    });

    if (!payment) {
      console.error(`Webhook: Payment record not found for reference ${reference}`);
      return;
    }

    // Skip if already processed
    if (payment.status === 'success') {
      console.log(`Webhook: Payment ${reference} already marked as successful`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'success',
        metadata: JSON.stringify({
          gateway_response,
          paid_at
        })
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'completed',
        status: 'processing'
      }
    });

    console.log(`Webhook: Successfully processed charge.success for ${reference}`);

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
    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'failed',
        metadata: JSON.stringify({ gateway_response })
      }
    });

    console.log(`Webhook: Successfully processed charge.failed for ${reference}`);

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
    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'abandoned'
      }
    });

    console.log(`Webhook: Successfully processed charge.abandoned for ${reference}`);

  } catch (error) {
    console.error('Webhook: Error handling charge.abandoned:', error);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
