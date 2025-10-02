import Stripe from 'stripe';

/**
 * Stripe Admin Client for Resume-Matcher
 *
 * Adapted from QuoteKit's enterprise-grade Stripe integration
 * Provides secure, typed access to Stripe API with proper error handling
 */

// Utility function for environment variable validation
function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  return varValue;
}

// Create default Stripe admin instance
export const stripeAdmin = new Stripe(
  getEnvVar(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY'),
  {
    // Latest Stripe API version
    apiVersion: '2023-10-16',
    // Register as official Stripe plugin
    appInfo: {
      name: 'Resume-Matcher',
      version: '1.0.0',
      url: 'https://resume-matcher.com',
    },
  }
);

// Interface for Stripe configuration
export interface StripeConfig {
  secret_key: string;
  publishable_key: string;
  webhook_secret: string;
  mode: 'test' | 'live';
}

// Create configurable Stripe client (for different environments)
export function createStripeAdminClient(config: { secret_key: string; mode: 'test' | 'live' }) {
  return new Stripe(config.secret_key, {
    apiVersion: '2023-10-16',
    appInfo: {
      name: 'Resume-Matcher Admin',
      version: '1.0.0',
    },
  });
}

// Test Stripe connection
export async function testStripeConnection(config: StripeConfig) {
  try {
    const stripe = createStripeAdminClient(config);

    // Test connection by retrieving account information
    const account = await stripe.accounts.retrieve();

    return {
      success: true,
      account_id: account.id,
      country: account.country,
      currency: account.default_currency,
      mode: config.mode
    };
  } catch (error) {
    console.error('Stripe connection test failed:', error);
    throw new Error(`Stripe connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to create Stripe checkout session
export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
  metadata?: Record<string, string>;
}) {
  const {
    customerId,
    customerEmail,
    priceId,
    successUrl,
    cancelUrl,
    mode = 'payment',
    metadata = {}
  } = params;

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        ...metadata,
        source: 'resume-matcher',
        created_at: new Date().toISOString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: customerId ? undefined : 'always',
    };

    // Add customer info if available
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripeAdmin.checkout.sessions.create(sessionConfig);

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw new Error(`Checkout session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to create payment intent for one-time purchases
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const {
    amount,
    currency = 'usd',
    customerId,
    customerEmail,
    metadata = {}
  } = params;

  try {
    const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      metadata: {
        ...metadata,
        source: 'resume-matcher',
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Add customer info if available
    if (customerId) {
      paymentIntentConfig.customer = customerId;
    } else if (customerEmail) {
      paymentIntentConfig.receipt_email = customerEmail;
    }

    const paymentIntent = await stripeAdmin.paymentIntents.create(paymentIntentConfig);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw new Error(`Payment intent creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to retrieve customer with creation if needed
export async function getOrCreateCustomer(params: {
  email: string;
  userId?: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  const { email, userId, name, metadata = {} } = params;

  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripeAdmin.customers.list({
      email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      return {
        success: true,
        customerId: customer.id,
        customer,
        created: false,
      };
    }

    // Create new customer
    const newCustomer = await stripeAdmin.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        user_id: userId || '',
        source: 'resume-matcher',
        created_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      customerId: newCustomer.id,
      customer: newCustomer,
      created: true,
    };
  } catch (error) {
    console.error('Failed to get/create customer:', error);
    throw new Error(`Customer operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to create subscription
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) {
  const { customerId, priceId, metadata = {}, trialPeriodDays } = params;

  try {
    const subscriptionConfig: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      metadata: {
        ...metadata,
        source: 'resume-matcher',
        created_at: new Date().toISOString(),
      },
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
    };

    // Add trial period if specified
    if (trialPeriodDays && trialPeriodDays > 0) {
      subscriptionConfig.trial_period_days = trialPeriodDays;
    }

    const subscription = await stripeAdmin.subscriptions.create(subscriptionConfig);

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
      status: subscription.status,
      subscription,
    };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw new Error(`Subscription creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to cancel subscription
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  try {
    let cancelledSubscription;

    if (immediately) {
      cancelledSubscription = await stripeAdmin.subscriptions.cancel(subscriptionId);
    } else {
      cancelledSubscription = await stripeAdmin.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return {
      success: true,
      subscriptionId: cancelledSubscription.id,
      status: cancelledSubscription.status,
      canceledAt: cancelledSubscription.canceled_at,
      endsAt: cancelledSubscription.ended_at,
    };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw new Error(`Subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export types for TypeScript usage
export type { Stripe };