/**
 * Simple in-memory rate limiter for API routes
 * Uses a sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for single-instance deployments)
// For production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier prefix (e.g., 'api', 'webhook', 'workflow') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
  limit: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { limit, windowSeconds, prefix = "default" } = config;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  // No existing entry or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowSeconds,
      limit,
    };
  }

  // Within window, check count
  if (entry.count >= limit) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetIn,
      limit,
    };
  }

  // Increment count
  entry.count++;
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success: true,
    remaining: limit - entry.count,
    resetIn,
    limit,
  };
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetIn.toString(),
  };
}

// Preset configurations for different use cases
export const RATE_LIMITS = {
  // Strict: 10 requests per minute (for sensitive operations)
  strict: { limit: 10, windowSeconds: 60, prefix: "strict" } as RateLimitConfig,

  // Standard: 60 requests per minute (for normal API calls)
  standard: {
    limit: 60,
    windowSeconds: 60,
    prefix: "standard",
  } as RateLimitConfig,

  // Workflow runs: 30 per minute per user
  workflowRun: {
    limit: 30,
    windowSeconds: 60,
    prefix: "workflow",
  } as RateLimitConfig,

  // Webhook: 100 per minute per workflow
  webhook: {
    limit: 100,
    windowSeconds: 60,
    prefix: "webhook",
  } as RateLimitConfig,

  // Auth: 5 attempts per minute (login, register)
  auth: { limit: 5, windowSeconds: 60, prefix: "auth" } as RateLimitConfig,
};
