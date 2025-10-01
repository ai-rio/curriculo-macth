/**
 * Payment API functions for Stripe integration
 */

import { api } from '../api';

/**
 * Request types
 */
export interface CreatePaymentIntentRequest {
  resume_id: string;
  job_id: string;
  user_id: string;
  user_email: string;
  success_url: string;
  cancel_url: string;
  amount?: number; // Default: 5000 (R$ 50.00)
  currency?: string; // Default: 'brl'
}

export interface ProcessImprovementRequest {
  resume_id: string;
  job_id: string;
  payment_intent_id: string;
}

export interface VerifyPaymentRequest {
  payment_intent_id: string;
  resume_id: string;
  job_id: string;
}

/**
 * Response types
 */
export interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
}

export interface ProcessImprovementResponse {
  success: boolean;
  improvement_id: string;
  status: string;
  message: string;
  data?: {
    optimized_content?: string;
    match_percentage?: number;
    suggestions?: string[];
    keywords?: string[];
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment_intent_id: string;
  status: string;
  amount_paid: number;
  currency: string;
  improvement_id?: string;
}

export interface PaymentIntentDetailsResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  client_secret: string;
  created: number;
  metadata: Record<string, string>;
}

/**
 * Payment API class
 */
export class PaymentAPI {
  /**
   * Create a Stripe Payment Intent
   */
  static async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    return api.post<CreatePaymentIntentResponse>('/api/v1/payments/create-intent', data);
  }

  /**
   * Process resume improvement after successful payment
   */
  static async processImprovement(
    data: ProcessImprovementRequest
  ): Promise<ProcessImprovementResponse> {
    return api.post<ProcessImprovementResponse>('/api/v1/resumes/improve', data);
  }

  /**
   * Verify a payment was successful
   */
  static async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    return api.post<VerifyPaymentResponse>('/api/v1/payments/verify', data);
  }

  /**
   * Get payment intent details
   */
  static async getPaymentIntentDetails(
    paymentIntentId: string
  ): Promise<PaymentIntentDetailsResponse> {
    return api.get<PaymentIntentDetailsResponse>(`/api/v1/payments/intent/${paymentIntentId}`);
  }
}
