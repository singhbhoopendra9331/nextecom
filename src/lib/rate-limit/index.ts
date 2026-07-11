import { NextResponse } from "next/server";

import {
  buildScopedIdentifier,
  getRequestIdentifier,
} from "@/lib/rate-limit/identifier";
import { getRateLimiter, type RateLimitKind } from "@/lib/rate-limit/limiters";

export type RateLimitFailure = {
  error: string;
  retryAfter: number;
};

/** @description Enforce a rate limit for a given kind and identifier. */

export async function enforceRateLimit(
  kind: RateLimitKind,
  identifier?: string
): Promise<RateLimitFailure | null> {
  const limiter = getRateLimiter(kind);
  if (!limiter) {
    return null;
  }

  const id = identifier ?? (await getRequestIdentifier());
  const result = await limiter.limit(id);

  if (result.success) {
    return null;
  }

  return {
    error: "Too many requests. Please try again later.",
    retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

export async function enforceAuthRateLimit(email?: string) {
  const blocked = await enforceRateLimit("auth");

  if (blocked) {
    return blocked;
  }

  if (!email) {
    return null;
  }

  return enforceRateLimit(
    "auth",
    buildScopedIdentifier("email", email.trim().toLowerCase())
  );
}

export function rateLimitResponse(failure: RateLimitFailure) {
  return NextResponse.json(
    { error: failure.error },
    {
      status: 429,
      headers: {
        "Retry-After": String(failure.retryAfter),
      },
    }
  );
}

export function rateLimitActionError(failure: RateLimitFailure) {
  return {
    success: false as const,
    error: failure.error,
  };
}
