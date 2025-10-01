/**
 * Database Types for Resume-Matcher
 *
 * These types are manually maintained to match the Supabase schema.
 * For production, generate these automatically using:
 * `supabase gen types typescript --project-id your-project-ref > types/database.types.ts`
 *
 * Updated for unified resume/job/improvement system
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
      resumes: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          content_type: string;
          file_size: number;
          storage_path: string;
          status: ResumeStatus;
          extracted_text: string | null;
          structured_data: Json | null;
          processing_started_at: string | null;
          processing_completed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          content_type: string;
          file_size: number;
          storage_path: string;
          status?: ResumeStatus;
          extracted_text?: string | null;
          structured_data?: Json | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          content_type?: string;
          file_size?: number;
          storage_path?: string;
          status?: ResumeStatus;
          extracted_text?: string | null;
          structured_data?: Json | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'resumes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          job_title: string | null;
          company: string | null;
          job_description: string;
          structured_data: Json | null;
          processing_started_at: string | null;
          processing_completed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title?: string | null;
          company?: string | null;
          job_description: string;
          structured_data?: Json | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_title?: string | null;
          company?: string | null;
          job_description?: string;
          structured_data?: Json | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      resume_improvements: {
        Row: {
          id: string;
          resume_id: string;
          job_id: string;
          user_id: string;
          status: ResumeStatus;
          match_percentage: number | null;
          suggestions: Json | null;
          keywords: Json | null;
          optimized_content: string | null;
          docx_storage_path: string | null;
          payment_intent_id: string;
          payment_verified: boolean;
          payment_verified_at: string | null;
          processing_started_at: string | null;
          processing_completed_at: string | null;
          ai_model: string | null;
          tokens_used: number | null;
          processing_time_ms: number | null;
          error_message: string | null;
          retry_count: number;
          data_anonymized: boolean;
          anonymized_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          job_id: string;
          user_id: string;
          status?: ResumeStatus;
          match_percentage?: number | null;
          suggestions?: Json | null;
          keywords?: Json | null;
          optimized_content?: string | null;
          docx_storage_path?: string | null;
          payment_intent_id: string;
          payment_verified?: boolean;
          payment_verified_at?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          ai_model?: string | null;
          tokens_used?: number | null;
          processing_time_ms?: number | null;
          error_message?: string | null;
          retry_count?: number;
          data_anonymized?: boolean;
          anonymized_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          job_id?: string;
          user_id?: string;
          status?: ResumeStatus;
          match_percentage?: number | null;
          suggestions?: Json | null;
          keywords?: Json | null;
          optimized_content?: string | null;
          docx_storage_path?: string | null;
          payment_intent_id?: string;
          payment_verified?: boolean;
          payment_verified_at?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          ai_model?: string | null;
          tokens_used?: number | null;
          processing_time_ms?: number | null;
          error_message?: string | null;
          retry_count?: number;
          data_anonymized?: boolean;
          anonymized_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'resume_improvements_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'resume_improvements_resume_id_fkey';
            columns: ['resume_id'];
            referencedRelation: 'resumes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'resume_improvements_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      improvement_analytics: {
        Row: {
          user_id: string;
          total_improvements: number;
          completed_count: number;
          failed_count: number;
          processing_count: number;
          total_tokens_used: number | null;
          avg_processing_time_ms: number | null;
          last_improvement_date: string | null;
          first_improvement_date: string | null;
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
      soft_delete_improvement: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_expired_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      resume_status: ResumeStatus;
    };
  };
}

// =====================================================
// ENUMS
// =====================================================

export type ResumeStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

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

export type Resume = Tables<'resumes'>;
export type ResumeInsert = Inserts<'resumes'>;
export type ResumeUpdate = Updates<'resumes'>;

export type Job = Tables<'jobs'>;
export type JobInsert = Inserts<'jobs'>;
export type JobUpdate = Updates<'jobs'>;

export type ResumeImprovement = Tables<'resume_improvements'>;
export type ResumeImprovementInsert = Inserts<'resume_improvements'>;
export type ResumeImprovementUpdate = Updates<'resume_improvements'>;

export type ImprovementAnalytics = Database['public']['Views']['improvement_analytics']['Row'];

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

export interface ResumeUploadResponse {
  message: string;
  requestId: string;
  resumeId: string;
}

export interface JobCreateResponse {
  message: string;
  jobId: string;
  request: {
    requestId: string;
    payload: any;
  };
}

export interface ResumeImprovementResponse {
  requestId: string;
  success: boolean;
  message: string;
  data: {
    resumeId: string;
    jobId: string;
    status: ResumeStatus;
    optimizedContent?: string;
    matchPercentage?: number;
    suggestions?: string[];
    keywords?: string[];
  };
}

export interface ResumeImprovementStatusResponse {
  id: string;
  resumeId: string;
  jobId: string;
  status: ResumeStatus;
  optimizedContent: string | null;
  docxStoragePath: string | null;
  matchPercentage: number | null;
  suggestions: string[] | null;
  keywords: string[] | null;
  errorMessage: string | null;
  createdAt: string;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
}

// =====================================================
// SUPABASE CLIENT TYPES
// =====================================================

export type { Database as SupabaseDatabase };
export type SupabaseTables = Database['public']['Tables'];
export type SupabaseViews = Database['public']['Views'];
export type SupabaseFunctions = Database['public']['Functions'];
export type SupabaseEnums = Database['public']['Enums'];
