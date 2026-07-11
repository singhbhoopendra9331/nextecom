import { InputJsonValue } from "@/generated/prisma/internal/prismaNamespaceBrowser";
import { JsonNullClass } from "@prisma/client/runtime/client";

/**
 * Recursively replaces `undefined` with `null` so values are safe for Prisma Json fields.
 * Prisma rejects `undefined` inside JSON arrays (e.g. BlockNote table columnWidths).
 */
export function sanitizeJsonForPrisma<T>(value: T): T {
  if (value === undefined) {
    return null as T;
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonForPrisma(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val !== undefined) {
      result[key] = sanitizeJsonForPrisma(val);
    }
  }

  return result as T;
}

type ContentType =
  | JsonNullClass
  | InputJsonValue
  | undefined
  | unknown
  | null
  | unknown[];

export function sanitizeBlockContent(content: ContentType): JsonNullClass | InputJsonValue | undefined {
  if (!Array.isArray(content)) {
    return [];
  }

  return sanitizeJsonForPrisma(content);
}
