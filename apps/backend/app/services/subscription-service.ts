import { supabaseAdminClient, createUserProfile, getOrCreateSubscription } from '@/libs/supabase/supabase-admin';
import { getOrCreateCustomer, createSubscription, createCheckoutSession } from '@/libs/stripe/stripe-admin';

/**
 * Subscription Service for Resume-Matcher
 *
 * Adapted from QuoteKit's subscription management system
 * Handles freemium model, usage tracking, and subscription lifecycle
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  stripePriceId?: string;
  isFree: boolean;
}

// Define subscription tiers
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out resume optimization',
    price: 0,
    currency: 'USD',
    interval: 'lifetime',
    features: [
      '1 optimization per month',
      'Basic ATS scoring',
      'Local AI processing',
      'Email support',
    ],
    isFree: true,
  },
  pro_lifetime: {
    id: 'pro_lifetime',
    name: 'Pro Lifetime',
    description: 'One-time payment for unlimited access',
    price: 2900, // $29.00 in cents
    currency: 'USD',
    interval: 'lifetime',
    features: [
      'Unlimited optimizations',
      'Advanced AI models',
      'Priority processing',
      'Professional templates',
      'Resume history',
      'Priority support',
      'Export to multiple formats',
    ],
    isFree: false,
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Monthly subscription for continuous access',
    price: 499, // $4.99 in cents
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited optimizations',
      'Advanced AI models',
      'Priority processing',
      'Professional templates',
      'Resume history',
      'Priority support',
      'Export to multiple formats',
      'Cancel anytime',
    ],
    isFree: false,
  },
};

/**
 * Create or get user's subscription profile
 */
export async function ensureUserSubscription(userId: string, email?: string, fullName?: string) {
  try {
    // Ensure user profile exists
    await createUserProfile({
      userId,
      email,
      fullName,
    });

    // Get or create subscription
    const { subscription, created } = await getOrCreateSubscription({ userId });

    // Update user's subscription status in profile
    await supabaseAdminClient
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return {
      success: true,
      subscription,
      created,
      tier: 'free',
    };
  } catch (error) {
    console.error('Failed to ensure user subscription:', error);
    throw new Error(`Subscription setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's current subscription and usage information
 */
export async function getUserSubscription(userId: string) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get subscription
    const { data: subscription, error: subscriptionError } = await supabaseAdminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['trialing', 'active', 'past_due'])
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError;
    }

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage, error: usageError } = await supabaseAdminClient
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_date', currentMonth)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    const tier = SUBSCRIPTION_TIERS[profile.subscription_tier] || SUBSCRIPTION_TIERS.free;
    const freeLimit = tier.isFree ? 1 : Infinity; // Free tier gets 1 optimization per month

    return {
      success: true,
      profile,
      subscription,
      usage: usage || {
        free_optimizations_used: 0,
        paid_optimizations_used: 0,
      },
      tier,
      remainingOptimizations: Math.max(0, freeLimit - (usage?.free_optimizations_used || 0)),
      isPro: profile.is_pro,
    };
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    throw new Error(`Subscription retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if user can create an optimization
 */
export async function canCreateOptimization(userId: string): Promise<{
  canCreate: boolean;
  remainingOptimizations: number;
  isPro: boolean;
  reason?: string;
}> {
  try {
    const subscription = await getUserSubscription(userId);

    if (subscription.isPro) {
      return {
        canCreate: true,
        remainingOptimizations: Infinity,
        isPro: true,
      };
    }

    if (subscription.remainingOptimizations > 0) {
      return {
        canCreate: true,
        remainingOptimizations: subscription.remainingOptimizations,
        isPro: false,
      };
    }

    return {
      canCreate: false,
      remainingOptimizations: 0,
      isPro: false,
      reason: 'You have used your free optimization for this month. Upgrade to Pro for unlimited access.',
    };
  } catch (error) {
    console.error('Failed to check optimization eligibility:', error);
    return {
      canCreate: false,
      remainingOptimizations: 0,
      isPro: false,
      reason: 'Unable to verify subscription status. Please try again.',
    };
  }
}

/**
 * Increment usage tracking for optimization
 */
export async function incrementUsage(userId: string, isFreeTier: boolean) {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Check if usage record exists for this month
    const { data: existingUsage, error: fetchError } = await supabaseAdminClient
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_date', currentMonth)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUsage) {
      // Update existing usage
      const updateData = isFreeTier
        ? { free_optimizations_used: existingUsage.free_optimizations_used + 1 }
        : { paid_optimizations_used: existingUsage.paid_optimizations_used + 1 };

      await supabaseAdminClient
        .from('usage_tracking')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUsage.id);
    } else {
      // Create new usage record
      await supabaseAdminClient
        .from('usage_tracking')
        .insert({
          user_id: userId,
          month_date: currentMonth,
          free_optimizations_used: isFreeTier ? 1 : 0,
          paid_optimizations_used: isFreeTier ? 0 : 1,
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to increment usage:', error);
    throw new Error(`Usage tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upgrade user to Pro tier
 */
export async function upgradeToPro(userId: string, tier: 'lifetime' | 'monthly', customerEmail?: string) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get or create Stripe customer
    const { customer, created: customerCreated } = await getOrCreateCustomer({
      email: customerEmail || profile.user_id, // Fallback to user_id if no email
      userId,
      name: profile.full_name || undefined,
    });

    // Update profile with Stripe customer ID
    if (customerCreated) {
      await supabaseAdminClient
        .from('profiles')
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }

    const selectedTier = tier === 'lifetime' ? SUBSCRIPTION_TIERS.pro_lifetime : SUBSCRIPTION_TIERS.pro_monthly;

    if (tier === 'lifetime') {
      // Create one-time payment session
      const { sessionId, url } = await createCheckoutSession({
        customerId: customer.id,
        priceId: selectedTier.stripePriceId || '', // Will need to be configured
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account?upgrade=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        mode: 'payment',
        metadata: {
          user_id: userId,
          tier: 'pro_lifetime',
        },
      });

      return {
        success: true,
        checkoutUrl: url,
        sessionId,
        tier: selectedTier,
      };
    } else {
      // Create subscription
      const { subscription, clientSecret } = await createSubscription({
        customerId: customer.id,
        priceId: selectedTier.stripePriceId || '', // Will need to be configured
        metadata: {
          user_id: userId,
          tier: 'pro_monthly',
        },
        trialPeriodDays: 7, // 7-day free trial
      });

      return {
        success: true,
        clientSecret,
        subscription,
        tier: selectedTier,
      };
    }
  } catch (error) {
    console.error('Failed to upgrade to Pro:', error);
    throw new Error(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle successful subscription upgrade
 */
export async function handleSubscriptionUpgrade(userId: string, stripeSubscriptionId: string, tier: string) {
  try {
    // Update user profile
    await supabaseAdminClient
      .from('profiles')
      .update({
        is_pro: true,
        subscription_tier: tier as 'lifetime' | 'monthly',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Update or create subscription record
    await supabaseAdminClient
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return { success: true };
  } catch (error) {
    console.error('Failed to handle subscription upgrade:', error);
    throw new Error(`Upgrade handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string, immediately = false) {
  try {
    const { subscription } = await getUserSubscription(userId);

    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    // This would be handled by Stripe webhooks when the subscription is canceled
    // For now, we'll just update the local status
    await supabaseAdminClient
      .from('subscriptions')
      .update({
        status: immediately ? 'canceled' : 'active',
        cancel_at_period_end: !immediately,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw new Error(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available subscription tiers
 */
export function getAvailableTiers() {
  return SUBSCRIPTION_TIERS;
}

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics() {
  try {
    // Count users by subscription tier
    const { data: tierCounts } = await supabaseAdminClient
      .from('profiles')
      .select('subscription_tier')
      .then(({ data }) => {
        const counts = data?.reduce((acc, profile) => {
          acc[profile.subscription_tier] = (acc[profile.subscription_tier] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        return { data: counts };
      });

    // Get monthly active users
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: monthlyStats } = await supabaseAdminClient
      .from('usage_tracking')
      .select('free_optimizations_used, paid_optimizations_used')
      .eq('month_date', currentMonth);

    const totalMonthlyOptimizations = monthlyStats?.reduce(
      (sum, usage) => sum + usage.free_optimizations_used + usage.paid_optimizations_used,
      0
    ) || 0;

    return {
      tierCounts,
      monthlyStats: {
        totalOptimizations: totalMonthlyOptimizations,
        activeUsers: monthlyStats?.length || 0,
      },
    };
  } catch (error) {
    console.error('Failed to get subscription analytics:', error);
    throw new Error(`Analytics retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}