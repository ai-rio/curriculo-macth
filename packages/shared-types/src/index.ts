/**
 * Shared TypeScript types for Resume-Matcher
 * Exports all models, API types, and error types
 */

// Export all models
export type {
  Profile,
  Optimization,
  OptimizationStatus,
  OptimizationCreate,
  OptimizationUpdate,
  OptimizationWithProfile,
} from './models';

// Export all API types
export type {
  ListResponse,
  OptimizationRequest,
  OptimizationCreateResponse,
  OptimizationResponse,
  UploadRequest,
  UploadResponse,
  HealthResponse,
  PaginationParams,
  OptimizationListParams,
} from './api';

// Export all error types
export {
  ErrorCode,
  ERROR_MESSAGES,
  HttpStatus,
  createApiError,
  isApiError,
} from './errors';
export type { ApiError, ValidationErrorDetail } from './errors';