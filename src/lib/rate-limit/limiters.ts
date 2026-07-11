import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/rate-limit/client";

export type RateLimitKind = "api" | "auth" | "submit";

const LIMITER_CONFIG: Record<
  RateLimitKind,
  { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}` }
> = {
  api: { requests: 120, window: "1 m" },
  submit: { requests: 10, window: "10 m" },
  auth: { requests: 10, window: "15 m" },
};

const limiters = new Map<RateLimitKind, Ratelimit>();

/** @description Get a rate limiter for a given kind. */
export function getRateLimiter(kind: RateLimitKind) {
  const existing = limiters.get(kind);
  if (existing) {
    return existing;
  }

  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const config = LIMITER_CONFIG[kind];
  
  /** @description Create a new rate limiter for a given kind. */
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `nextecom:rl:${kind}`,
    analytics: true,
  });

  limiters.set(kind, limiter);
  return limiter;
}
