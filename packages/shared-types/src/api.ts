/**
 * API request/response types for Resume-Matcher
 * Reference: docs/development/architecture.md
 */

import type { Resume, Job, ResumeStatus } from './models';

/**
 * Generic list response wrapper
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  page_size?: number;
}

/**
 * Request to upload a resume file
 * POST /api/v1/resumes/upload
 */
export interface ResumeUploadRequest {
  /** File to upload (PDF or DOCX) */
  file: File;
}

/**
 * Response after uploading resume
 * Returns resume ID and storage information
 */
export interface ResumeUploadResponse {
  /** Success message */
  message: string;
  /** Request ID for tracking */
  request_id: string;
  /** UUID of uploaded resume */
  resume_id: string;
}

/**
 * Request to create a job from description
 * POST /api/v1/jobs/upload
 */
export interface JobCreateRequest {
  /** Job description text */
  job_description: string;
  /** Optional job title */
  job_title?: string;
  /** Optional company name */
  company?: string;
}

/**
 * Response after creating job
 */
export interface JobCreateResponse {
  /** Success message */
  message: string;
  /** UUID of created job */
  job_id: string;
  /** Request metadata */
  request: {
    request_id: string;
    payload: JobCreateRequest;
  };
}

/**
 * Request to improve resume with AI (requires payment)
 * POST /api/v1/resumes/improve
 */
export interface ResumeImprovementRequest {
  /** Resume ID to improve */
  resume_id: string;
  /** Job ID to match against */
  job_id: string;
  /** Stripe payment intent ID */
  payment_intent_id: string;
}

/**
 * Response for resume improvement
 */
export interface ResumeImprovementResponse {
  /** Request ID for tracking */
  request_id: string;
  /** Success status */
  success: boolean;
  /** Response message */
  message: string;
  /** Optimization result data */
  data: {
    resume_id: string;
    job_id: string;
    status: ResumeStatus;
    optimized_content?: string;
    download_url?: string;
    match_percentage?: number;
    suggestions?: string[];
    keywords?: string[];
  };
}

/**
 * Response for GET /api/v1/resumes
 * Returns resume data with processed information
 */
export interface ResumeResponse {
  /** Request ID for tracking */
  request_id: string;
  /** Resume data */
  data: {
    resume: Resume;
    processed_resume?: {
      id: string;
      resume_id: string;
      extracted_text: string;
      structured_data?: unknown;
      created_at: string;
      updated_at: string;
    };
  };
}

/**
 * Response for GET /api/v1/jobs
 * Returns job data with processed information
 */
export interface JobResponse {
  /** Request ID for tracking */
  request_id: string;
  /** Job data */
  data: {
    job: Job;
    processed_job?: {
      id: string;
      job_id: string;
      parsed_content: unknown;
      structured_data?: unknown;
      created_at: string;
      updated_at: string;
    };
  };
}

/**
 * Health check response
 * GET /health
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  page_size?: number;
}