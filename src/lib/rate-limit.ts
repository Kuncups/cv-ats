import { SITE_CONFIG } from "@/config/site";

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Sliding window rate limiter based on client IP or user token.
 * Self-cleans old timestamps to prevent memory leaks.
 */
export function checkRateLimit(
  identifier: string,
  limit = SITE_CONFIG.security.rateLimitMaxRequests,
  windowSec = SITE_CONFIG.security.rateLimitWindowSec
): { success: boolean; remaining: number; resetSec: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const cutoff = now - windowMs;

  const record = memoryStore.get(identifier) || { timestamps: [] };
  // Keep only timestamps within window
  const activeTimestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetSec = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetSec: Math.max(1, resetSec),
    };
  }

  activeTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: activeTimestamps });

  // Periodically clean stale entries if memoryStore grows
  if (memoryStore.size > 5000) {
    for (const [key, val] of memoryStore.entries()) {
      if (val.timestamps.every((ts) => ts <= cutoff)) {
        memoryStore.delete(key);
      }
    }
  }

  return {
    success: true,
    remaining: limit - activeTimestamps.length,
    resetSec: windowSec,
  };
}
