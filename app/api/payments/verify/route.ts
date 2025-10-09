// =====================================================
// PAYMENT VERIFICATION API ENDPOINT
// =====================================================
// This endpoint verifies a Paystack payment transaction
// and updates the order and payment status
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paystackService } from '@/lib/paystack';

interface VerifyPaymentRequest {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();
    
    if (!body.reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        orders!inner(
          id,
          customer_id,
          order_number,
          total_amount,
          payment_status
        )
      `)
      .eq('paystack_reference', body.reference)
      .single();

    if (paymentError || !payment) {
      console.error('Payment record not found:', paymentError);
      return NextResponse.json({
        success: false,
        error: 'Payment record not found'
      }, { status: 404 });
    }

    // If payment is already verified as successful, return the status
    if (payment.status === 'success') {
      return NextResponse.json({
        success: true,
        data: {
          status: 'success',
          message: 'Payment already verified',
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount
        }
      });
    }

    // Verify transaction with Paystack
    const verification = await paystackService.verifyTransaction(body.reference);
    
    if (!verification.status) {
      console.error('Paystack verification failed:', verification);
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed with Paystack'
      }, { status: 400 });
    }

    const { data: transactionData } = verification;
    const isPaymentSuccessful = paystackService.isPaymentSuccessful(transactionData.status);
    const paymentStatus = isPaymentSuccessful ? 'success' : 'failed';

    // Update payment record
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: paymentStatus,
        gateway_response: transactionData.gateway_response,
        paid_at: isPaymentSuccessful ? new Date(transactionData.paid_at).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', body.reference);

    if (updatePaymentError) {
      console.error('Error updating payment record:', updatePaymentError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment record'
      }, { status: 500 });
    }

    // Update order status if payment successful
    if (isPaymentSuccessful) {
      const { error: updateOrderError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.order_id);

      if (updateOrderError) {
        console.error('Error updating order status:', updateOrderError);
        // Don't fail the request if order update fails, payment verification is more important
      }

      // TODO: Here you could add logic to:
      // - Send confirmation email to customer
      // - Update inventory/stock
      // - Trigger fulfillment process
      // - Send notification to admin
    }

    return NextResponse.json({
      success: true,
      data: {
        status: paymentStatus,
        message: paystackService.getPaymentStatusMessage(paymentStatus),
        payment_id: payment.id,
        order_id: payment.order_id,
        order_number: payment.orders.order_number,
        amount: payment.amount,
        currency: payment.currency,
        paid_at: isPaymentSuccessful ? transactionData.paid_at : null,
        transaction: {
          reference: transactionData.reference,
          gateway_response: transactionData.gateway_response,
          channel: transactionData.channel,
          authorization: transactionData.authorization
        }
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle GET request for verification via URL parameters (for callback page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Use the same verification logic as POST
    const verificationRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference })
    });

    return await POST(verificationRequest as NextRequest);

  } catch (error) {
    console.error('Error in GET verification:', error);
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