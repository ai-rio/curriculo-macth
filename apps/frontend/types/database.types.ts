/**
 * Database Types for Resume-Matcher
 *
 * These types are manually maintained to match the Supabase schema.
 * For production, generate these automatically using:
 * `supabase gen types typescript --project-id your-project-ref > types/database.types.ts`
 *
 * @see /supabase/migrations/20250929000000_initial_schema.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          data_retention_date: string | null;
          consent_marketing: boolean;
          consent_data_processing: boolean;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          data_retention_date?: string | null;
          consent_marketing?: boolean;
          consent_data_processing?: boolean;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          data_retention_date?: string | null;
          consent_marketing?: boolean;
          consent_data_processing?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      optimizations: {
        Row: {
          id: string;
          user_id: string;
          input_resume_filename: string;
          input_resume_storage_path: string | null;
          input_job_description: string;
          output_optimized_resume: string | null;
          storage_path_docx: string | null;
          status: OptimizationStatus;
          stripe_payment_id: string | null;
          stripe_payment_status: string | null;
          processing_started_at: string | null;
          processing_completed_at: string | null;
          error_message: string | null;
          ai_model_used: string | null;
          ai_tokens_used: number | null;
          ai_processing_time_ms: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_resume_filename: string;
          input_resume_storage_path?: string | null;
          input_job_description: string;
          output_optimized_resume?: string | null;
          storage_path_docx?: string | null;
          status?: OptimizationStatus;
          stripe_payment_id?: string | null;
          stripe_payment_status?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          ai_model_used?: string | null;
          ai_tokens_used?: number | null;
          ai_processing_time_ms?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_resume_filename?: string;
          input_resume_storage_path?: string | null;
          input_job_description?: string;
          output_optimized_resume?: string | null;
          storage_path_docx?: string | null;
          status?: OptimizationStatus;
          stripe_payment_id?: string | null;
          stripe_payment_status?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          ai_model_used?: string | null;
          ai_tokens_used?: number | null;
          ai_processing_time_ms?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'optimizations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      optimization_analytics: {
        Row: {
          user_id: string;
          total_optimizations: number;
          completed_count: number;
          failed_count: number;
          processing_count: number;
          total_tokens_used: number | null;
          avg_processing_time_ms: number | null;
          last_optimization_date: string | null;
          first_optimization_date: string | null;
        };
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: void;
      };
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: void;
      };
      soft_delete_optimization: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_expired_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      optimization_status: OptimizationStatus;
    };
  };
}

// =====================================================
// ENUMS
// =====================================================

export type OptimizationStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// =====================================================
// HELPER TYPES
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// =====================================================
// CONVENIENCE TYPES
// =====================================================

export type Profile = Tables<'profiles'>;
export type ProfileInsert = Inserts<'profiles'>;
export type ProfileUpdate = Updates<'profiles'>;

export type Optimization = Tables<'optimizations'>;
export type OptimizationInsert = Inserts<'optimizations'>;
export type OptimizationUpdate = Updates<'optimizations'>;

export type OptimizationAnalytics = Database['public']['Views']['optimization_analytics']['Row'];

// =====================================================
// STORAGE BUCKET TYPES
// =====================================================

export interface ResumeBucketFile {
  bucket: 'resumes';
  path: string;
  userId: string;
  filename: string;
}

export interface OptimizedResumeBucketFile {
  bucket: 'optimized-resumes';
  path: string;
  userId: string;
  filename: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface OptimizationCreateRequest {
  resumeFilename: string;
  resumeStoragePath: string;
  jobDescription: string;
}

export interface OptimizationCreateResponse {
  optimizationId: string;
  checkoutUrl: string;
  status: OptimizationStatus;
}

export interface OptimizationStatusResponse {
  id: string;
  status: OptimizationStatus;
  optimizedText: string | null;
  downloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

// =====================================================
// SUPABASE CLIENT TYPES
// =====================================================

export type { Database as SupabaseDatabase };
export type SupabaseTables = Database['public']['Tables'];
export type SupabaseViews = Database['public']['Views'];
export type SupabaseFunctions = Database['public']['Functions'];
export type SupabaseEnums = Database['public']['Enums'];
