/**
 * PaymentButton Component
 *
 * Stripe payment button for résumé optimization payment (R$ 50.00)
 * Handles payment flow using Payment Intents (unified system)
 */

'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PaymentAPI } from '@/lib/api/payments';
import { translations } from '@/lib/i18n';
import { getStripe } from '@/lib/stripe';
import { createBrowserClient } from '@/lib/supabase/client';

interface PaymentButtonProps {
  resumeId: string;
  jobId: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentButton({ resumeId, jobId, onSuccess, onError }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user session
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(translations.payment.errors.notAuthenticated);
        router.push('/login');
        return;
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Create payment intent
      const paymentIntent = await PaymentAPI.createPaymentIntent({
        resume_id: resumeId,
        job_id: jobId,
        user_id: session.user.id,
        user_email: session.user.email!,
        success_url: `${siteUrl}/payment/success?payment_intent_id={PAYMENT_INTENT_ID}&resume_id=${resumeId}&job_id=${jobId}`,
        cancel_url: `${siteUrl}/payment/cancelled`,
        amount: 5000, // R$ 50.00
        currency: 'brl',
      });

      // Store IDs for use after payment
      sessionStorage.setItem('pending_resume_id', resumeId);
      sessionStorage.setItem('pending_job_id', jobId);
      sessionStorage.setItem('pending_payment_intent_id', paymentIntent.payment_intent_id);

      // Load Stripe
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error('Stripe não pôde ser carregado');
      }

      // Confirm payment on client side
      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: paymentIntent.client_secret,
        confirmParams: {
          return_url: `${siteUrl}/payment/success?payment_intent_id=${paymentIntent.payment_intent_id}&resume_id=${resumeId}&job_id=${jobId}`,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onSuccess?.(paymentIntent.payment_intent_id);
    } catch (err: any) {
      const errorMessage = err?.detail || err?.message || translations.payment.errors.paymentFailed;
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
        variant="default"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {translations.payment.processing}
          </>
        ) : (
          translations.payment.button
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {translations.payment.securePayment}
      </p>
    </div>
  );
}
