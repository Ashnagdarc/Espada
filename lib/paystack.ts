// =====================================================
// PAYSTACK SERVICE - PAYMENT PROCESSING
// =====================================================
// This service handles all Paystack API interactions
// for payment initialization, verification, and webhooks
// =====================================================

import crypto from 'crypto';

interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
}

interface InitializeTransactionRequest {
  email: string;
  amount: number; // in kobo (NGN) or cents (USD)
  reference: string;
  callback_url: string;
  metadata?: {
    order_id: string;
    customer_id: string;
    [key: string]: string | number | boolean;
  };
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
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
  };
}

class PaystackService {
  private config: PaystackConfig;

  constructor() {
    this.config = {
      secretKey: process.env.PAYSTACK_SECRET_KEY || '',
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      baseUrl: 'https://api.paystack.co'
    };

    // Warn if required environment variables are missing (only in production)
    if (!this.config.secretKey && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  PAYSTACK_SECRET_KEY environment variable is not set');
    }
    if (!this.config.publicKey && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  PAYSTACK_PUBLIC_KEY environment variable is not set');
    }
  }

  /**
   * Initialize a payment transaction with Paystack
   */
  async initializeTransaction(data: InitializeTransactionRequest): Promise<InitializeTransactionResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Paystack API error: ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction with Paystack
   */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Paystack verification error: ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `ESP_${timestamp}_${random}`;
  }

  /**
   * Convert amount to kobo (NGN smallest unit)
   * Paystack expects amounts in kobo for NGN
   */
  convertToKobo(amount: number): number {
    // Convert from dollars to kobo (NGN smallest unit)
    // 1 USD = 100 cents, 1 NGN = 100 kobo
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from kobo to main currency unit
   */
  convertFromKobo(amountInKobo: number): number {
    return amountInKobo / 100;
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('PAYSTACK_WEBHOOK_SECRET environment variable is required');
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Get public key for frontend usage
   */
  getPublicKey(): string {
    return this.config.publicKey;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Check if payment status is successful
   */
  isPaymentSuccessful(status: string): boolean {
    return status === 'success';
  }

  /**
   * Get payment status message
   */
  getPaymentStatusMessage(status: string): string {
    switch (status) {
      case 'success':
        return 'Payment completed successfully';
      case 'failed':
        return 'Payment failed';
      case 'abandoned':
        return 'Payment was abandoned';
      case 'pending':
        return 'Payment is being processed';
      default:
        return 'Unknown payment status';
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();

// Export types for use in other files
export type {
  InitializeTransactionRequest,
  InitializeTransactionResponse,
  VerifyTransactionResponse,
  PaystackConfig
};