import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripeAdmin } from "@/libs/stripe/stripe-admin";
import {
  verifyWebhookSignature,
  validateWebhookEvent,
  rateLimit,
  createWebhookSecurityConfig,
  WEBHOOK_TIMEOUT_MS
} from "@/libs/stripe/webhook-security";
import { createSupabaseAdminClient } from "@/libs/supabase/supabase-admin";

/**
 * Stripe Webhook Handler for Resume-Matcher
 *
 * Enterprise-grade webhook security adapted from QuoteKit
 * Handles all Stripe events with proper validation, rate limiting, and error handling
 */

// Security configuration
const webhookSecurity = createWebhookSecurityConfig({
  secret: process.env.STRIPE_WEBHOOK_SECRET || '',
  timeoutMs: WEBHOOK_TIMEOUT_MS,
});

// Event types we handle
const SUPPORTED_EVENT_TYPES = [
  // Payment events
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.requires_action',

  // Checkout sessions
  'checkout.session.completed',
  'checkout.session.expired',

  // Subscription events
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.upcoming',

  // Customer events
  'customer.created',
  'customer.updated',
  'customer.deleted',
];

/**
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `webhook_${startTime}_${Math.random().toString(36).substring(7)}`;

  try {
    // Rate limiting by IP
    const clientIP = request.ip ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!rateLimit(clientIP)) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Get webhook signature from headers
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error(`[${requestId}] Missing Stripe signature`);
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
    const signatureResult = verifyWebhookSignature(
      body,
      signature,
      webhookSecurity.secret,
      webhookSecurity.signatureToleranceMs
    );

    if (!signatureResult.valid) {
      console.error(`[${requestId}] Invalid webhook signature:`, signatureResult.error);
      return NextResponse.json(
        {
          error: "Invalid signature",
          details: signatureResult.error
        },
        { status: 401 }
      );
    }

    // Parse and validate event
    let event: Stripe.Event;
    try {
      event = stripeAdmin.webhooks.constructEvent(body, signature, webhookSecurity.secret);
    } catch (error) {
      console.error(`[${requestId}] Failed to construct Stripe event:`, error);
      return NextResponse.json(
        { error: "Invalid event" },
        { status: 400 }
      );
    }

    // Additional event validation
    const eventValidation = validateWebhookEvent(event);
    if (!eventValidation.valid) {
      console.error(`[${requestId}] Invalid event structure:`, eventValidation.error);
      return NextResponse.json(
        { error: eventValidation.error },
        { status: 400 }
      );
    }

    // Check if we support this event type
    if (!SUPPORTED_EVENT_TYPES.includes(event.type)) {
      console.log(`[${requestId}] Unsupported event type: ${event.type}`);
      return NextResponse.json({ received: true });
    }

    // Process the event
    console.log(`[${requestId}] Processing ${event.type} event:`, event.id);

    const result = await processWebhookEvent(event, requestId);

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Event processed successfully in ${processingTime}ms`);

    return NextResponse.json({
      received: true,
      processed: true,
      eventId: event.id,
      eventType: event.type,
      processingTime,
      requestId,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Webhook processing failed after ${processingTime}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId,
        processingTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Process individual webhook events
 */
async function processWebhookEvent(event: Stripe.Event, requestId: string): Promise<any> {
  const supabase = createSupabaseAdminClient();

  // Log webhook receipt for debugging
  await supabase.from('webhook_logs').insert({
    id: requestId,
    event_id: event.id,
    event_type: event.type,
    created_at: new Date(event.created * 1000).toISOString(),
    processed: false,
    received_at: new Date().toISOString(),
  });

  let result;

  switch (event.type) {
    // Payment intents
    case 'payment_intent.succeeded':
      result = await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      result = await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    // Checkout sessions
    case 'checkout.session.completed':
      result = await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    // Subscriptions
    case 'customer.subscription.created':
      result = await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.updated':
      result = await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      result = await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    // Invoices
    case 'invoice.payment_succeeded':
      result = await handleInvoiceSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      result = await handleInvoiceFailed(event.data.object as Stripe.Invoice);
      break;

    // Customers
    case 'customer.created':
      result = await handleCustomerCreated(event.data.object as Stripe.Customer);
      break;

    default:
      console.warn(`[${requestId}] No handler for event type: ${event.type}`);
      result = { handled: false, reason: 'No handler' };
  }

  // Update webhook log with processing result
  await supabase
    .from('webhook_logs')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      result: result,
    })
    .eq('id', requestId);

  return result;
}

/**
 * Event handlers
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // Update optimization record
  if (paymentIntent.metadata?.optimization_id) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from('optimizations')
      .update({
        status: 'completed',
        stripe_payment_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.metadata.optimization_id);
  }

  return { handled: true, paymentIntentId: paymentIntent.id };
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  // Update optimization record with failure
  if (paymentIntent.metadata?.optimization_id) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from('optimizations')
      .update({
        status: 'failed',
        stripe_payment_id: paymentIntent.id,
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
      .eq('id', paymentIntent.metadata.optimization_id);
  }

  return { handled: true, paymentIntentId: paymentIntent.id };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`Checkout completed: ${session.id}`);

  // Handle subscription creation or one-time purchase
  if (session.mode === 'subscription' && session.subscription) {
    const supabase = createSupabaseAdminClient();

    // Update or create subscription record
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: session.metadata?.user_id,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }

  return { handled: true, sessionId: session.id };
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);

  const supabase = createSupabaseAdminClient();

  // Update subscription in database
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: subscription.metadata?.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date(subscription.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

  return { handled: true, subscriptionId: subscription.id };
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  const supabase = createSupabaseAdminClient();

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  return { handled: true, subscriptionId: subscription.id };
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  const supabase = createSupabaseAdminClient();

  // Mark subscription as canceled
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  return { handled: true, subscriptionId: subscription.id };
}

async function handleInvoiceSucceeded(invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`);

  // Record payment for analytics
  const supabase = createSupabaseAdminClient();
  await supabase.from('payment_history').insert({
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription as string,
    stripe_customer_id: invoice.customer as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    paid_at: new Date().toISOString(),
  });

  return { handled: true, invoiceId: invoice.id };
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`);

  // Record failed payment
  const supabase = createSupabaseAdminClient();
  await supabase.from('payment_history').insert({
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription as string,
    stripe_customer_id: invoice.customer as string,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    failed_at: new Date().toISOString(),
    error_message: invoice.last_finalization_error?.message,
  });

  return { handled: true, invoiceId: invoice.id };
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`Customer created: ${customer.id}`);

  // Link customer to user if metadata contains user_id
  if (customer.metadata?.user_id) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', customer.metadata.user_id);
  }

  return { handled: true, customerId: customer.id };
}

/**
 * Health check endpoint for webhooks
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    supportedEvents: SUPPORTED_EVENT_TYPES,
  });
}