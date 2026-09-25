import { NextResponse } from "next/server";

/**
 * Enterprise In-Memory Sliding Window Rate Limiter
 * Protects against:
 * 1. Brute-Force & Credential Stuffing (Auth endpoints)
 * 2. Database Flooding & Spammed Game Records (POST /api/games)
 * 3. Scraping & DoS attacks on Database queries (GET endpoints)
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale IP records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000); // keep last 1 hour
        if (record.timestamps.length === 0) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}

export type RateLimitCategory =
  | "AUTH" // Login, Register (5 req / 60s)
  | "GAME_SUBMISSION" // Saving games & post-game analysis (15 req / 60s)
  | "API_READ" // Leaderboard, Puzzles, Tournaments list (60 req / 60s)
  | "SESSION_CHECK" // /api/auth/me (60 req / 60s)
  | "USER_UPDATE" // Profile updates (10 req / 60s)
  | "GLOBAL_API"; // General API safety net (120 req / 60s)

export interface RateLimitOptions {
  limit: number; // Maximum allowed requests within window
  windowSeconds: number; // Time window in seconds
}

export const RATE_LIMIT_PRESETS: Record<RateLimitCategory, RateLimitOptions> = {
  AUTH: { limit: 5, windowSeconds: 60 },
  GAME_SUBMISSION: { limit: 15, windowSeconds: 60 },
  API_READ: { limit: 60, windowSeconds: 60 },
  SESSION_CHECK: { limit: 60, windowSeconds: 60 },
  USER_UPDATE: { limit: 10, windowSeconds: 60 },
  GLOBAL_API: { limit: 120, windowSeconds: 60 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Base Rate Limiting function
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = store.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    store.set(identifier, record);
  }

  // Filter timestamps strictly inside current window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.timestamps.length,
    resetInSeconds: options.windowSeconds,
  };
}

/**
 * Check rate limit using preset categories
 */
export function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = "GLOBAL_API"
): RateLimitResult {
  const preset = RATE_LIMIT_PRESETS[category] || RATE_LIMIT_PRESETS.GLOBAL_API;
  return rateLimit(identifier, preset);
}

/**
 * Extract reliable Client IP address from Request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Standard HTTP Rate Limit Headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, result.remaining).toString(),
  };

  if (!result.success) {
    headers["Retry-After"] = result.resetInSeconds.toString();
  }

  return headers;
}

/**
 * Generate standard HTTP 429 Too Many Requests response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau ${result.resetInSeconds} giây.`;

  return NextResponse.json(
    {
      success: false,
      error: message,
      retryAfter: result.resetInSeconds,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(result),
    }
  );
}
