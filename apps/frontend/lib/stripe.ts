/**
 * Stripe client configuration for Resume-Matcher frontend.
 *
 * Provides loadStripe singleton for frontend payment flows.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get or create the Stripe instance.
 *
 * This function lazily loads the Stripe SDK and returns a promise
 * that resolves to the Stripe object.
 *
 * @returns Promise<Stripe | null>
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
