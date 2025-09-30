/**
 * Shared TypeScript models matching Supabase database schema
 * Reference: docs/development/database-schema.md
 */

/**
 * Profile model - represents a user in the system
 * Maps to 'profiles' table in Supabase
 */
export interface Profile {
  /** UUID from auth.users */
  id: string;
  /** User's email address (unique) */
  email: string;
  /** User's full name (optional) */
  full_name: string | null;
  /** Whether user has given LGPD data consent */
  data_consent_given: boolean;
  /** When consent was granted */
  data_consent_date: string | null;
  /** Scheduled deletion date for LGPD compliance */
  data_retention_date: string | null;
  /** ISO 8601 timestamp when profile was created */
  created_at: string;
  /** ISO 8601 timestamp when profile was last updated */
  updated_at: string;
}

/**
 * Optimization status enum
 */
export type OptimizationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Optimization model - represents a resume optimization request
 * Maps to 'optimizations' table in Supabase
 */
export interface Optimization {
  /** UUID primary key */
  id: string;
  /** Foreign key to profiles.id */
  user_id: string;
  /** Current processing status */
  status: OptimizationStatus;
  /** Original resume text extracted from uploaded file */
  resume_text: string;
  /** Job description provided by user */
  job_description: string;
  /** Match percentage between resume and job (0-100) */
  match_percentage: number | null;
  /** AI-generated optimization suggestions (JSON array) */
  suggestions: unknown | null;
  /** Optimized resume text */
  optimized_text: string | null;
  /** Stripe payment ID for this optimization */
  stripe_payment_id: string;
  /** Whether payment has been verified */
  payment_verified: boolean;
  /** When payment was verified */
  payment_verified_at: string | null;
  /** When processing started */
  started_at: string | null;
  /** When processing completed */
  completed_at: string | null;
  /** AI model used (e.g., "anthropic/claude-3.5-sonnet") */
  ai_model: string | null;
  /** Number of tokens used by AI */
  tokens_used: number | null;
  /** Processing time in milliseconds */
  processing_time_ms: number | null;
  /** Error message if status is 'failed' */
  error_message: string | null;
  /** Number of retry attempts */
  retry_count: number;
  /** Whether data has been anonymized (LGPD) */
  data_anonymized: boolean;
  /** When data was anonymized */
  anonymized_at: string | null;
  /** ISO 8601 timestamp when optimization was created */
  created_at: string;
  /** ISO 8601 timestamp when optimization was last updated */
  updated_at: string;
}

/**
 * Partial optimization for create operations
 */
export type OptimizationCreate = Pick<
  Optimization,
  'user_id' | 'resume_text' | 'job_description' | 'stripe_payment_id'
> & {
  status?: OptimizationStatus;
};

/**
 * Partial optimization for update operations
 */
export type OptimizationUpdate = Partial<
  Pick<
    Optimization,
    | 'status'
    | 'match_percentage'
    | 'suggestions'
    | 'optimized_text'
    | 'payment_verified'
    | 'payment_verified_at'
    | 'started_at'
    | 'completed_at'
    | 'ai_model'
    | 'tokens_used'
    | 'processing_time_ms'
    | 'error_message'
    | 'retry_count'
  >
>;

/**
 * Optimization with related profile data
 */
export interface OptimizationWithProfile extends Optimization {
  profile: Profile;
}