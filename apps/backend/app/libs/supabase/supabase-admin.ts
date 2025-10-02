import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client for Resume-Matcher
 *
 * Adapted from QuoteKit's Supabase integration
 * Provides admin-level access to Supabase for server-side operations
 */

// Utility function for environment variable validation
function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  return varValue;
}

// Create admin client with service role key
export const supabaseAdminClient = createClient(
  getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  getEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Type definitions for database tables (will be expanded)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          is_pro: boolean;
          stripe_customer_id: string | null;
          subscription_status: 'free' | 'active' | 'canceled' | 'past_due';
          subscription_tier: 'free' | 'lifetime' | 'monthly';
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      stripe_products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          active: boolean;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stripe_products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['stripe_products']['Row']>;
      };
      stripe_prices: {
        Row: {
          id: string;
          stripe_product_id: string;
          active: boolean;
          description: string | null;
          unit_amount: number | null;
          currency: string;
          type: 'one_time' | 'recurring';
          interval: 'day' | 'week' | 'month' | 'year' | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stripe_prices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['stripe_prices']['Row']>;
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string;
          content: string;
          content_type: string;
          storage_path: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['resumes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['resumes']['Row']>;
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          content: string;
          content_type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Row']>;
      };
      optimizations: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string;
          job_id: string;
          original_score: number | null;
          optimized_score: number | null;
          optimized_content: string | null;
          ai_model_used: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
          stripe_payment_id: string | null;
          is_free_tier: boolean;
          paid_at: string | null;
          error_message: string | null;
        };
        Insert: Omit<Database['public']['Tables']['optimizations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['optimizations']['Row']>;
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          month_date: string;
          free_optimizations_used: number;
          paid_optimizations_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usage_tracking']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usage_tracking']['Row']>;
      };
      payment_history: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string;
          stripe_invoice_id: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
          description: string | null;
          created_at: string;
          paid_at: string | null;
          failed_at: string | null;
          error_message: string | null;
        };
        Insert: Omit<Database['public']['Tables']['payment_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_history']['Row']>;
      };
      webhook_logs: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          created_at: string;
          processed: boolean;
          received_at: string;
          processed_at: string | null;
          result: any;
        };
        Insert: Omit<Database['public']['Tables']['webhook_logs']['Row'], 'id' | 'created_at' | 'received_at'>;
        Update: Partial<Database['public']['Tables']['webhook_logs']['Row']>;
      };
    };
    Views: {
      user_analytics: {
        Row: {
          user_id: string;
          total_optimizations: number;
          free_optimizations: number;
          paid_optimizations: number;
          total_revenue: number;
          current_subscription_status: string;
          current_subscription_tier: string;
          last_optimization_at: string | null;
        };
      };
      subscription_analytics: {
        Row: {
          date: string;
          new_subscriptions: number;
          canceled_subscriptions: number;
          active_subscriptions: number;
          monthly_recurring_revenue: number;
        };
      };
    };
    Functions: {
      create_free_subscription: {
        Args: {
          user_id: string;
        };
        Returns: {
          success: boolean;
          subscription_id: string | null;
          error: string | null;
        };
      };
      increment_usage: {
        Args: {
          user_id: string;
          is_free_tier: boolean;
        };
        Returns: {
          success: boolean;
          remaining_optimizations: number;
          error: string | null;
        };
      };
      get_user_usage: {
        Args: {
          user_id: string;
          month_date?: string;
        };
        Returns: {
          free_optimizations_used: number;
          paid_optimizations_used: number;
          remaining_free: number;
          month_date: string;
        };
      };
    };
  };
}

// Helper function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdminClient
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      connected: true,
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    throw new Error(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to create user profile
export async function createUserProfile(params: {
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}) {
  const { userId, email, fullName, avatarUrl } = params;

  try {
    const { data, error } = await supabaseAdminClient
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        is_pro: false,
        subscription_status: 'free',
        subscription_tier: 'free',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw new Error(`Profile creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to get or create user subscription
export async function getOrCreateSubscription(params: {
  userId: string;
  tier?: 'free' | 'lifetime' | 'monthly';
}) {
  const { userId, tier = 'free' } = params;

  try {
    // Check if user already has subscription
    const { data: existingSubscription, error: fetchError } = await supabaseAdminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['trialing', 'active', 'past_due'])
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingSubscription) {
      return { success: true, subscription: existingSubscription, created: false };
    }

    // Create new subscription
    const { data: newSubscription, error: createError } = await supabaseAdminClient
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        // No Stripe IDs for free tier
        stripe_subscription_id: null,
        stripe_customer_id: null,
        stripe_price_id: null,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return { success: true, subscription: newSubscription, created: true };
  } catch (error) {
    console.error('Failed to get/create subscription:', error);
    throw new Error(`Subscription operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default supabaseAdminClient;