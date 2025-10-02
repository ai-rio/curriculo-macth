import crypto from "crypto";

/**
 * Stripe Webhook Security Utilities
 *
 * Adapted from QuoteKit's enterprise-grade webhook security implementation
 * Provides secure signature verification, rate limiting, and replay attack prevention
 */

// Security constants
export const WEBHOOK_TIMEOUT_MS = 30000; // 30 second timeout
export const SIGNATURE_TOLERANCE_MS = 300000; // 5 minutes tolerance for timestamp
export const MAX_BODY_SIZE = 1024 * 1024; // 1MB max body size

// Rate limiting for webhook endpoint
const webhookAttempts = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
export const MAX_WEBHOOK_ATTEMPTS = 100; // Max 100 webhooks per minute per IP

/**
 * Rate limiting function to prevent webhook abuse
 */
export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  const window = webhookAttempts.get(identifier);

  if (!window || now > window.resetTime) {
    webhookAttempts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (window.count >= MAX_WEBHOOK_ATTEMPTS) {
    return false;
  }

  window.count++;
  return true;
}

/**
 * Enhanced signature verification with timestamp validation
 * Prevents replay attacks and ensures webhook authenticity
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string,
  tolerance: number = SIGNATURE_TOLERANCE_MS,
): {
    valid: boolean;
    timestamp?: number;
    error?: string;
    details?: any;
  } {
  try {
    // Validate inputs
    if (!body || !signature || !webhookSecret) {
      return {
        valid: false,
        error: "Missing required parameters for signature verification"
      };
    }

    // Check body size
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_SIZE) {
      return {
        valid: false,
        error: `Body size exceeds maximum allowed size of ${MAX_BODY_SIZE} bytes`
      };
    }

    // Parse signature header
    const elements = signature.split(",");
    let timestamp: number | undefined;
    let signatures: string[] = [];

    for (const element of elements) {
      const [key, value] = element.split("=");
      if (key === "t") {
        timestamp = parseInt(value, 10);
      } else if (key === "v1") {
        signatures.push(value);
      }
    }

    if (!timestamp) {
      return {
        valid: false,
        error: "No timestamp found in signature"
      };
    }

    if (signatures.length === 0) {
      return {
        valid: false,
        error: "No signature found in signature header"
      };
    }

    // Check timestamp tolerance to prevent replay attacks
    const timestampDiff = Math.abs(Date.now() - (timestamp * 1000));
    if (timestampDiff > tolerance) {
      return {
        valid: false,
        timestamp,
        error: `Timestamp outside tolerance window: ${timestampDiff}ms > ${tolerance}ms`,
        details: {
          timestamp: new Date(timestamp * 1000).toISOString(),
          currentTime: new Date().toISOString(),
          difference: timestampDiff,
        }
      };
    }

    // Verify signature using constant-time comparison
    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload, "utf8")
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const signatureValid = signatures.some((sig) =>
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(sig, "hex"),
      )
    );

    if (!signatureValid) {
      return {
        valid: false,
        timestamp,
        error: "Signature verification failed",
        details: {
          expectedSignature: expectedSignature.substring(0, 8) + "...",
          receivedSignatures: signatures.map(sig => sig.substring(0, 8) + "..."),
        }
      };
    }

    return {
      valid: true,
      timestamp
    };
  } catch (error) {
    return {
      valid: false,
      error: `Signature verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        timestamp: Date.now(),
      }
    };
  }
}

/**
 * Validate webhook event structure
 */
export function validateWebhookEvent(event: any): {
  valid: boolean;
  error?: string;
  eventType?: string;
} {
  try {
    // Check required fields
    if (!event || typeof event !== 'object') {
      return { valid: false, error: "Invalid event structure" };
    }

    if (!event.id || !event.type || !event.created) {
      return {
        valid: false,
        error: "Missing required event fields (id, type, created)"
      };
    }

    // Check event type format
    if (typeof event.type !== 'string' || !event.type.includes('.')) {
      return {
        valid: false,
        error: "Invalid event type format"
      };
    }

    // Check created timestamp
    const createdTimestamp = typeof event.created === 'number'
      ? event.created
      : new Date(event.created).getTime() / 1000;

    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - createdTimestamp);

    // Reject events older than 24 hours or from the future
    if (timeDiff > 24 * 60 * 60) {
      return {
        valid: false,
        error: `Event timestamp outside acceptable range: ${timeDiff} seconds`
      };
    }

    return {
      valid: true,
      eventType: event.type
    };
  } catch (error) {
    return {
      valid: false,
      error: `Event validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate webhook signature for testing
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: number,
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return `t=${ts},v1=${signature}`;
}

/**
 * Webhook security configuration
 */
export interface WebhookSecurityConfig {
  secret: string;
  timeoutMs?: number;
  maxBodySize?: number;
  signatureToleranceMs?: number;
  rateLimitWindowMs?: number;
  maxWebhookAttempts?: number;
}

/**
 * Create webhook security configuration with defaults
 */
export function createWebhookSecurityConfig(config: Partial<WebhookSecurityConfig>): WebhookSecurityConfig {
  return {
    secret: config.secret,
    timeoutMs: config.timeoutMs || WEBHOOK_TIMEOUT_MS,
    maxBodySize: config.maxBodySize || MAX_BODY_SIZE,
    signatureToleranceMs: config.signatureToleranceMs || SIGNATURE_TOLERANCE_MS,
    rateLimitWindowMs: config.rateLimitWindowMs || RATE_LIMIT_WINDOW_MS,
    maxWebhookAttempts: config.maxWebhookAttempts || MAX_WEBHOOK_ATTEMPTS,
  };
}