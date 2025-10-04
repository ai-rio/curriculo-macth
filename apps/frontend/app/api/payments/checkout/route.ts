import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';

interface CreateCheckoutSessionRequest {
  tier: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CreateCheckoutSessionResponse {
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutSessionRequest = await request.json();
    const { tier, successUrl, cancelUrl, metadata } = body;

    // Validate required fields
    if (!tier || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Get user session
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      // Call backend API to create checkout session
      const response = await api.post<{
        session_id: string;
        checkout_url: string;
      }>('/api/v1/payments/checkout', {
        tier,
        success_url: successUrl,
        cancel_url: cancelUrl,
        user_id: session?.user?.id,
        metadata,
      });

      return NextResponse.json({
        sessionId: response.session_id,
        checkoutUrl: response.checkout_url,
      } satisfies CreateCheckoutSessionResponse);
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
        } satisfies CreateCheckoutSessionResponse);
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
