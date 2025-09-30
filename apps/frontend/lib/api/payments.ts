/**
 * Payment API functions for Stripe integration
 */

import { api } from '../api';

/**
 * Request types
 */
export interface CreateCheckoutRequest {
  optimization_id: string;
  user_id: string;
  user_email: string;
  success_url: string;
  cancel_url: string;
  amount?: number; // Default: 5000 (R$ 50.00)
}

export interface VerifyPaymentRequest {
  session_id: string;
  optimization_id: string;
}

/**
 * Response types
 */
export interface CreateCheckoutResponse {
  session_id: string;
  checkout_url: string;
  expires_at: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  optimization_id: string;
  status: string;
  amount_paid: number;
  currency: string;
}

export interface SessionDetailsResponse {
  payment_status: string;
  status: string;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  payment_intent: string | null;
  metadata: Record<string, string>;
}

/**
 * Payment API class
 */
export class PaymentAPI {
  /**
   * Create a Stripe Checkout session
   */
  static async createCheckoutSession(data: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    return api.post<CreateCheckoutResponse>('/api/v1/payments/create-checkout', data);
  }

  /**
   * Verify a payment was successful
   */
  static async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    return api.post<VerifyPaymentResponse>('/api/v1/payments/verify', data);
  }

  /**
   * Get checkout session details
   */
  static async getSessionDetails(sessionId: string): Promise<SessionDetailsResponse> {
    return api.get<SessionDetailsResponse>(`/api/v1/payments/session/${sessionId}`);
  }
}
