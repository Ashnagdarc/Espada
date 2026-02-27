// =====================================================
// PAYMENT VERIFICATION API ENDPOINT
// =====================================================
// This endpoint verifies a Paystack payment transaction
// and updates the order and payment status
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const payment = await prisma.payment.findUnique({
      where: { reference: body.reference },
      include: {
        order: true
      }
    });

    if (!payment) {
      console.error('Payment record not found');
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
          order_id: payment.orderId,
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
    await prisma.payment.update({
      where: { reference: body.reference },
      data: {
        status: paymentStatus,
        transactionId: transactionData.id?.toString(),
        metadata: JSON.stringify({
          gateway_response: transactionData.gateway_response,
          paid_at: isPaymentSuccessful ? transactionData.paid_at : null,
          channel: transactionData.channel,
          authorization: transactionData.authorization
        })
      }
    });

    // Update order status if payment successful
    if (isPaymentSuccessful) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'completed',
          status: 'processing'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: paymentStatus,
        message: paystackService.getPaymentStatusMessage(paymentStatus),
        payment_id: payment.id,
        order_id: payment.orderId,
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
