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
 * Resume status enum
 */
export type ResumeStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

/**
 * Resume model - represents a uploaded resume file
 * Maps to 'resumes' table in Supabase
 */
export interface Resume {
  /** UUID primary key */
  id: string;
  /** Foreign key to profiles.id */
  user_id: string;
  /** Original filename */
  filename: string;
  /** File content type (MIME type) */
  content_type: string;
  /** File size in bytes */
  file_size: number;
  /** Storage path in Supabase Storage */
  storage_path: string;
  /** Current processing status */
  status: ResumeStatus;
  /** Extracted text content */
  extracted_text: string | null;
  /** Structured resume data (JSON) */
  structured_data: unknown | null;
  /** When processing started */
  processing_started_at: string | null;
  /** When processing completed */
  processing_completed_at: string | null;
  /** Error message if status is 'failed' */
  error_message: string | null;
  /** ISO 8601 timestamp when resume was created */
  created_at: string;
  /** ISO 8601 timestamp when resume was last updated */
  updated_at: string;
}

/**
 * Job model - represents a job description
 * Maps to 'jobs' table in Supabase
 */
export interface Job {
  /** UUID primary key */
  id: string;
  /** Foreign key to profiles.id */
  user_id: string;
  /** Job title */
  job_title: string | null;
  /** Company name */
  company: string | null;
  /** Original job description text */
  job_description: string;
  /** Structured job data (JSON) */
  structured_data: unknown | null;
  /** When processing started */
  processing_started_at: string | null;
  /** When processing completed */
  processing_completed_at: string | null;
  /** Error message if processing failed */
  error_message: string | null;
  /** ISO 8601 timestamp when job was created */
  created_at: string;
  /** ISO 8601 timestamp when job was last updated */
  updated_at: string;
}

/**
 * Resume Improvement model - represents AI optimization results
 * Maps to 'resume_improvements' table in Supabase
 */
export interface ResumeImprovement {
  /** UUID primary key */
  id: string;
  /** Foreign key to resumes.id */
  resume_id: string;
  /** Foreign key to jobs.id */
  job_id: string;
  /** Foreign key to profiles.id */
  user_id: string;
  /** Current processing status */
  status: ResumeStatus;
  /** Match percentage between resume and job (0-100) */
  match_percentage: number | null;
  /** AI-generated optimization suggestions */
  suggestions: string[] | null;
  /** Extracted keywords */
  keywords: string[] | null;
  /** Optimized resume content */
  optimized_content: string | null;
  /** Generated DOCX file storage path */
  docx_storage_path: string | null;
  /** Stripe payment intent ID */
  payment_intent_id: string;
  /** Whether payment has been verified */
  payment_verified: boolean;
  /** When payment was verified */
  payment_verified_at: string | null;
  /** When processing started */
  processing_started_at: string | null;
  /** When processing completed */
  processing_completed_at: string | null;
  /** AI model used */
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
  /** ISO 8601 timestamp when improvement was created */
  created_at: string;
  /** ISO 8601 timestamp when improvement was last updated */
  updated_at: string;
}

/**
 * Partial resume for create operations
 */
export type ResumeCreate = Pick<
  Resume,
  'user_id' | 'filename' | 'content_type' | 'file_size' | 'storage_path'
> & {
  status?: ResumeStatus;
};

/**
 * Partial job for create operations
 */
export type JobCreate = Pick<
  Job,
  'user_id' | 'job_title' | 'company' | 'job_description'
>;

/**
 * Partial resume improvement for create operations
 */
export type ResumeImprovementCreate = Pick<
  ResumeImprovement,
  'resume_id' | 'job_id' | 'user_id' | 'payment_intent_id'
> & {
  status?: ResumeStatus;
};

/**
 * Resume with related profile data
 */
export interface ResumeWithProfile extends Resume {
  profile: Profile;
}

/**
 * Job with related profile data
 */
export interface JobWithProfile extends Job {
  profile: Profile;
}

/**
 * Resume Improvement with related data
 */
export interface ResumeImprovementWithRelations extends ResumeImprovement {
  resume: Resume;
  job: Job;
  profile: Profile;
}