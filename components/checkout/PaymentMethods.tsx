'use client';

import React, { useState } from 'react';
import { CreditCard, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export type PaymentMethod = 'paystack' | 'cash_on_delivery';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onPaystackPayment: () => Promise<void>;
  onCashOnDeliveryOrder: () => Promise<void>;
  isProcessing: boolean;
  disabled?: boolean;
  totalAmount: number;
  currency?: string;
}

export default function PaymentMethods({
  selectedMethod,
  onMethodChange,
  onPaystackPayment,
  onCashOnDeliveryOrder,
  isProcessing,
  disabled = false,
  totalAmount,
  currency = 'NGN'
}: PaymentMethodsProps) {
  const [error, setError] = useState<string | null>(null);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (disabled || isProcessing) return;
    setError(null);
    onMethodChange(method);
  };

  const handlePaystackPayment = async () => {
    try {
      setError(null);
      await onPaystackPayment();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    }
  };

  const handleCashOnDeliveryOrder = async () => {
    try {
      setError(null);
      await onCashOnDeliveryOrder();
    } catch (error) {
      console.error('Order error:', error);
      setError(error instanceof Error ? error.message : 'Order failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Method
        </h3>
        <p className="text-sm text-gray-600">
          Choose your preferred payment method
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Payment Method Options */}
      <div className="space-y-3">
        {/* Paystack Card Payment */}
        <div
          className={`
            relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
            ${selectedMethod === 'paystack'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => handlePaymentMethodChange('paystack')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedMethod === 'paystack'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === 'paystack' && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Pay with Card
                </h4>
                <p className="text-sm text-gray-600">
                  Secure payment via Paystack
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://paystack.com/assets/img/payments/mastercard.png"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="https://paystack.com/assets/img/payments/visa.png"
                alt="Visa"
                className="h-6"
              />
              <img
                src="https://paystack.com/assets/img/payments/verve.png"
                alt="Verve"
                className="h-6"
              />
            </div>
          </div>
          
          {selectedMethod === 'paystack' && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700 mb-3">
                You will be redirected to Paystack to complete your payment securely.
              </p>
              <Button
                onClick={handlePaystackPayment}
                disabled={isProcessing || disabled}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ${formatAmount(totalAmount)} with Card`
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Cash on Delivery */}
        <div
          className={`
            relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
            ${selectedMethod === 'cash_on_delivery'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => handlePaymentMethodChange('cash_on_delivery')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedMethod === 'cash_on_delivery'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === 'cash_on_delivery' && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
              <Truck className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Cash on Delivery
                </h4>
                <p className="text-sm text-gray-600">
                  Pay when your order arrives
                </p>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">
              Available
            </div>
          </div>
          
          {selectedMethod === 'cash_on_delivery' && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="bg-green-100 p-3 rounded-lg mb-3">
                <h5 className="font-medium text-green-800 mb-1">
                  Cash on Delivery Terms:
                </h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Payment due upon delivery</li>
                  <li>• Exact amount required (no change given)</li>
                  <li>• Order will be confirmed before dispatch</li>
                  <li>• Delivery within 2-5 business days</li>
                </ul>
              </div>
              <Button
                onClick={handleCashOnDeliveryOrder}
                disabled={isProcessing || disabled}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order - ${formatAmount(totalAmount)} (COD)`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Secure Checkout</p>
            <p>
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}