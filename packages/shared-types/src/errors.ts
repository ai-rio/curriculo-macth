/**
 * Error handling types for Resume-Matcher
 * Standardized error codes and responses
 */

/**
 * Standard error codes used across the application
 */
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  OPTIMIZATION_NOT_FOUND = 'OPTIMIZATION_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Payment errors (402/400)
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_PAYMENT = 'INVALID_PAYMENT',
  PAYMENT_NOT_VERIFIED = 'PAYMENT_NOT_VERIFIED',

  // Processing errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Service unavailable (503)
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  /** Field name that failed validation */
  field: string;
  /** Error message for this field */
  message: string;
  /** Invalid value provided */
  value?: unknown;
}

/**
 * Standard API error response
 */
export interface ApiError {
  /** Error code from ErrorCode enum */
  code: ErrorCode;
  /** Human-readable error message (in pt-BR) */
  message: string;
  /** HTTP status code */
  status: number;
  /** Additional error details (e.g., validation errors) */
  details?: ValidationErrorDetail[] | Record<string, unknown>;
  /** Request ID for tracking */
  request_id?: string;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

/**
 * Error messages in Brazilian Portuguese
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.UNAUTHORIZED]: 'Você precisa estar autenticado para acessar este recurso.',
  [ErrorCode.INVALID_TOKEN]: 'Token de autenticação inválido.',
  [ErrorCode.TOKEN_EXPIRED]: 'Sua sessão expirou. Por favor, faça login novamente.',

  // Authorization
  [ErrorCode.FORBIDDEN]: 'Você não tem permissão para acessar este recurso.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes para esta ação.',

  // Validation
  [ErrorCode.VALIDATION_ERROR]: 'Erro de validação nos dados enviados.',
  [ErrorCode.INVALID_INPUT]: 'Os dados fornecidos são inválidos.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Campo obrigatório não foi fornecido.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Tipo de arquivo inválido. Use PDF, DOCX ou TXT.',
  [ErrorCode.FILE_TOO_LARGE]: 'O arquivo é muito grande. O tamanho máximo é 5MB.',

  // Resources
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.OPTIMIZATION_NOT_FOUND]: 'Otimização não encontrada.',
  [ErrorCode.USER_NOT_FOUND]: 'Usuário não encontrado.',

  // Payment
  [ErrorCode.PAYMENT_REQUIRED]: 'Pagamento necessário para continuar.',
  [ErrorCode.PAYMENT_FAILED]: 'O pagamento falhou. Por favor, tente novamente.',
  [ErrorCode.INVALID_PAYMENT]: 'Informações de pagamento inválidas.',
  [ErrorCode.PAYMENT_NOT_VERIFIED]: 'Pagamento não verificado.',

  // Processing
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor. Por favor, tente novamente mais tarde.',
  [ErrorCode.AI_SERVICE_ERROR]: 'Erro ao processar com o serviço de IA. Por favor, tente novamente.',
  [ErrorCode.PROCESSING_FAILED]: 'Falha no processamento da otimização.',
  [ErrorCode.STORAGE_ERROR]: 'Erro ao acessar o armazenamento de arquivos.',
  [ErrorCode.DATABASE_ERROR]: 'Erro ao acessar o banco de dados.',

  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Muitas requisições. Por favor, aguarde alguns minutos.',

  // Service
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
  [ErrorCode.MAINTENANCE_MODE]: 'Sistema em manutenção. Por favor, tente novamente em alguns instantes.',
};

/**
 * Create a standardized API error
 */
export function createApiError(
  code: ErrorCode,
  status: number,
  details?: ValidationErrorDetail[] | Record<string, unknown>,
  customMessage?: string
): ApiError {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code],
    status,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  );
}

/**
 * HTTP status codes commonly used
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;