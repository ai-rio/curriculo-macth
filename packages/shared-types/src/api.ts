/**
 * API request/response types for Resume-Matcher
 * Reference: docs/development/architecture.md
 */

import type { Optimization, OptimizationStatus } from './models';

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
 * Request to create a new optimization job
 * POST /api/optimizations
 */
export interface OptimizationRequest {
  /** Extracted text from uploaded resume */
  resume_text: string;
  /** Job description provided by user */
  job_description: string;
  /** Stripe payment ID from checkout session */
  stripe_payment_id: string;
}

/**
 * Response after creating optimization
 * Returns optimization ID and Stripe checkout URL
 */
export interface OptimizationCreateResponse {
  /** UUID of created optimization */
  id: string;
  /** Stripe Checkout Session URL for payment */
  checkout_url: string;
  /** Current status (should be 'pending') */
  status: OptimizationStatus;
}

/**
 * Response for GET /api/optimizations/:id
 * Returns full optimization details
 */
export interface OptimizationResponse extends Optimization {
  /** Download URL for optimized resume (if completed) */
  download_url?: string | null;
}

/**
 * Request to upload a file
 * Used for resume uploads to Supabase Storage
 */
export interface UploadRequest {
  /** File name */
  file_name: string;
  /** File MIME type (application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain) */
  content_type: string;
  /** File size in bytes */
  file_size: number;
}

/**
 * Response after requesting upload URL
 */
export interface UploadResponse {
  /** Signed upload URL from Supabase Storage */
  upload_url: string;
  /** Storage path where file will be saved */
  storage_path: string;
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

/**
 * Query parameters for listing optimizations
 * GET /api/optimizations
 */
export interface OptimizationListParams extends PaginationParams {
  /** Filter by status */
  status?: OptimizationStatus;
  /** Sort by field (created_at, updated_at) */
  sort_by?: 'created_at' | 'updated_at';
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
}