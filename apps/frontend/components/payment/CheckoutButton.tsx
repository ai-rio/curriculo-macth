/**
 * CheckoutButton Component
 *
 * Stripe Checkout button for résumé optimization payment (R$ 50.00)
 * Handles payment flow and redirects to Stripe Checkout
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentAPI } from '@/lib/api/payments';
import { translations } from '@/lib/i18n';
import { getStripe } from '@/lib/stripe';
import { createBrowserClient } from '@/lib/supabase/client';

interface CheckoutButtonProps {
  optimizationId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CheckoutButton({ optimizationId, onSuccess, onError }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
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

      // Create checkout session
      const checkoutSession = await PaymentAPI.createCheckoutSession({
        optimization_id: optimizationId,
        user_id: session.user.id,
        user_email: session.user.email!,
        success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/payment/cancelled`,
        amount: 5000, // R$ 50.00
      });

      // Load Stripe and redirect to checkout
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error('Stripe não pôde ser carregado');
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: checkoutSession.session_id,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.detail || err?.message || translations.payment.errors.checkoutFailed;
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCheckout}
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
