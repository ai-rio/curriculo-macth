'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, CheckCircle, CreditCard, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFlowProps {
  tier: {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year' | 'lifetime';
    stripePriceId?: string;
    description: string;
    features: string[];
    isFree?: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'requires_action';

interface PaymentResponse {
  clientSecret?: string;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export default function PaymentFlow({ tier, onSuccess, onCancel, onError }: PaymentFlowProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentIntent = async (): Promise<PaymentResponse> => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.id,
          price: tier.price,
          currency: tier.currency,
          // Add any additional metadata needed
          metadata: {
            tier_name: tier.name,
            source: 'resume-matcher-web',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPaymentStatus('idle');
      return data;
    } catch (error) {
      setPaymentStatus('error');
      setPaymentResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      onError?.(error instanceof Error ? error : new Error('Payment error'));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const createCheckoutSession = async (): Promise<PaymentResponse> => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.id,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/canceled`,
          metadata: {
            tier_name: tier.name,
            source: 'resume-matcher-web',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPaymentStatus('idle');
      return data;
    } catch (error) {
      setPaymentStatus('error');
      setPaymentResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      onError?.(error instanceof Error ? error : new Error('Checkout error'));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    try {
      let response: PaymentResponse;

      if (tier.isFree) {
        // Free plan - just redirect to success
        window.location.href = `${window.location.origin}/payment/success?tier=free`;
        return;
      }

      // Paid plan - create payment intent or checkout session
      if (tier.stripePriceId) {
        response = await createPaymentIntent();
      } else {
        response = await createCheckoutSession();
      }

      if (response.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkoutUrl;
      } else if (response.clientSecret) {
        // Handle payment confirmation
        setPaymentResponse(response);
      }
    } catch (error) {
      console.error('Payment flow error:', error);
    }
  };

  // Stripe Payment Element component
  const StripePaymentForm = ({ clientSecret }: { clientSecret: string }) => {
    const [isComplete, setIsComplete] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0570de',
            },
          },
        }}
      >
        <div className="p-6">
          {/* Stripe Element would go here */}
          {/*
          <PaymentElement
            options={{
              layout: "tabs"
            }}
            onChange={(e) => {
              setIsComplete(e.complete)
              setErrorMessage(e.error?.message || null)
            }}
          />
          */}
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-muted-foreground">Stripe Payment Element Integration</p>
            <p className="text-xs text-muted-foreground mt-2">Payment form would appear here</p>
          </div>

          {errorMessage && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={!isComplete || isProcessing}>
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Pay Now'
              )}
            </Button>
          </div>
        </div>
      </Elements>
    );
  };

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>{tier.name}</span>
                {tier.isFree && <Badge variant="secondary">Free</Badge>}
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {tier.isFree ? (
                  'Free'
                ) : (
                  <>
                    ${(tier.price / 100).toFixed(2)}
                    <span className="text-lg text-muted-foreground ml-1">
                      {tier.currency}{' '}
                      {tier.interval === 'lifetime' ? 'one-time' : `/${tier.interval}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Features */}
            <div>
              <h4 className="font-medium mb-2">What you get:</h4>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Security Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>Stripe protected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <Card>
          <CardContent className="pt-6">
            {paymentStatus === 'processing' && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Processing your payment... Please wait.</AlertDescription>
              </Alert>
            )}

            {paymentStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment successful! You&apos;ll receive a confirmation email shortly.
                </AlertDescription>
              </Alert>
            )}

            {paymentStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Payment failed: {paymentResponse?.error}
                </AlertDescription>
              </Alert>
            )}

            {paymentStatus === 'requires_action' && (
              <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Additional authentication required. Please check your email.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {paymentResponse?.clientSecret && (
        <StripePaymentForm clientSecret={paymentResponse.clientSecret} />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!tier.isFree && (
          <Button
            onClick={handlePayment}
            disabled={isProcessing || paymentStatus === 'processing'}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : paymentResponse?.clientSecret ? (
              'Complete Payment'
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay Now
              </div>
            )}
          </Button>
        )}

        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>SSL encrypted secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
