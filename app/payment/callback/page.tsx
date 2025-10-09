'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface PaymentVerificationResult {
  success: boolean;
  message: string;
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
  };
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    paystack_reference: string;
  };
}

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        setError(null);

        // Use reference from URL params (Paystack sends this)
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          throw new Error('No payment reference found in URL');
        }

        console.log('Verifying payment with reference:', paymentReference);

        // Call our verification API
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentReference,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Payment verification failed');
        }

        setVerificationResult(result);

        // If payment was successful, redirect to order confirmation after a delay
        if (result.success && result.order) {
          setTimeout(() => {
            router.push(`/account/orders/${result.order.id}?payment=success`);
          }, 3000);
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        setError(error instanceof Error ? error.message : 'Payment verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, trxref, router]);

  const formatAmount = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = () => {
    if (isVerifying) {
      return <LoadingSpinner size="lg" />;
    }

    if (error) {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }

    if (verificationResult?.success) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }

    return <AlertCircle className="h-16 w-16 text-yellow-500" />;
  };

  const getStatusMessage = () => {
    if (isVerifying) {
      return {
        title: 'Verifying Payment...',
        description: 'Please wait while we confirm your payment with Paystack.',
      };
    }

    if (error) {
      return {
        title: 'Verification Failed',
        description: error,
      };
    }

    if (verificationResult?.success) {
      return {
        title: 'Payment Successful!',
        description: verificationResult.message || 'Your payment has been processed successfully.',
      };
    }

    if (verificationResult && !verificationResult.success) {
      return {
        title: 'Payment Failed',
        description: verificationResult.message || 'Your payment could not be processed.',
      };
    }

    return {
      title: 'Processing...',
      description: 'Please wait while we process your payment.',
    };
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {statusMessage.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {statusMessage.description}
        </p>

        {/* Payment Details */}
        {verificationResult && !isVerifying && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            
            {verificationResult.payment && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-gray-900">
                    {verificationResult.payment.paystack_reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(verificationResult.payment.amount, verificationResult.payment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold capitalize ${
                    verificationResult.payment.status === 'success' 
                      ? 'text-green-600' 
                      : verificationResult.payment.status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {verificationResult.payment.status}
                  </span>
                </div>
              </div>
            )}

            {verificationResult.order && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-mono text-gray-900">
                      {verificationResult.order.order_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span className="font-semibold capitalize text-gray-900">
                      {verificationResult.order.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {verificationResult?.success && verificationResult.order && (
            <Link href={`/account/orders/${verificationResult.order.id}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                View Order Details
              </Button>
            </Link>
          )}

          {!isVerifying && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Auto-redirect Notice */}
        {verificationResult?.success && verificationResult.order && (
          <p className="text-xs text-gray-500 mt-4">
            You will be automatically redirected to your order details in a few seconds...
          </p>
        )}

        {/* Support Notice */}
        {error && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              If you continue to experience issues, please contact our support team with your payment reference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}