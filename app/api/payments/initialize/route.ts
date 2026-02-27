// =====================================================
// PAYMENT INITIALIZATION API ENDPOINT
// =====================================================
// This endpoint initializes a Paystack payment transaction
// and creates a payment record in the database
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: body.order_id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Verify customer email matches
    const userEmail = order.user?.email || order.user?.profile?.email;
    if (!userEmail || userEmail !== body.customer_email) {
      return NextResponse.json({
        success: false,
        error: 'Customer email does not match order'
      }, { status: 403 });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Order already paid'
      }, { status: 400 });
    }

    // Check if there's already a pending payment for this order
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: body.order_id }
    });

    if (existingPayment && existingPayment.status === 'pending' && existingPayment.metadata) {
      const metadata = JSON.parse(existingPayment.metadata);
      if (metadata.authorization_url) {
        return NextResponse.json({
          success: true,
          data: {
            authorization_url: metadata.authorization_url,
            message: 'Using existing pending payment'
          }
        });
      }
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
        user_id: order.userId,
        customer_id: order.userId
      }
    });

    if (!paystackResponse.status) {
      console.error('Paystack initialization failed:', paystackResponse);
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize payment with Paystack'
      }, { status: 500 });
    }

    // Save or update payment record
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          reference: reference,
          amount: body.amount,
          currency: body.currency || 'NGN',
          status: 'pending',
          metadata: JSON.stringify({
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code
          })
        }
      });
    } else {
      await prisma.payment.create({
        data: {
          userId: order.userId,
          orderId: body.order_id,
          reference: reference,
          amount: body.amount,
          currency: body.currency || 'NGN',
          status: 'pending',
          paymentMethod: 'paystack',
          metadata: JSON.stringify({
            authorization_url: paystackResponse.data.authorization_url,
            access_code: paystackResponse.data.access_code
          })
        }
      });
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