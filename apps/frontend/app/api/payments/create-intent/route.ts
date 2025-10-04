import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';

interface CreatePaymentIntentRequest {
  tier: string;
  price: number;
  currency: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentIntentResponse {
  clientSecret?: string;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json();
    const { tier, price, currency, metadata } = body;

    // Validate required fields
    if (!tier || price === undefined || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, price, currency' },
        { status: 400 }
      );
    }

    // Get user session
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      // Call backend API to create payment intent
      const response = await api.post<{
        client_secret?: string;
        session_id?: string;
        checkout_url?: string;
      }>('/api/v1/payments/create-intent', {
        tier,
        amount: price,
        currency,
        user_id: session?.user?.id,
        metadata,
      });

      return NextResponse.json({
        clientSecret: response.client_secret,
        sessionId: response.session_id,
        checkoutUrl: response.checkout_url,
      } satisfies CreatePaymentIntentResponse);
    } catch (apiError) {
      console.error('Backend API error:', apiError);

      // If backend is not available, return a mock response for development
      if (process.env.NODE_ENV === 'development') {
        // For development, create a mock checkout session
        const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockCheckoutUrl = `https://checkout.stripe.com/pay/#/test/${mockSessionId}`;

        return NextResponse.json({
          sessionId: mockSessionId,
          checkoutUrl: mockCheckoutUrl,
        } satisfies CreatePaymentIntentResponse);
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);

    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
