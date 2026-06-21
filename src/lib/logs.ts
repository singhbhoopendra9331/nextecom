import type { Prisma } from "@/generated/prisma/client";
import { LogLevel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppLogLevel } from "@/lib/logs/constants";

export type { AppLogLevel } from "@/lib/logs/constants";
export { LOG_LEVELS, LOG_LEVEL_LABELS } from "@/lib/logs/constants";

export type LogQueryFilters = {
  page?: number;
  limit?: number;
  q?: string;
  level?: LogLevel | "";
  source?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type NormalizedLogPayload = {
  message: string;
  context?: Prisma.InputJsonValue;
  stack?: string;
  source?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeLogArgs(args: unknown[]): NormalizedLogPayload {
  if (args.length === 0) {
    return { message: "Empty log entry" };
  }

  let message = "";
  let stack: string | undefined;
  let source: string | undefined;
  const contextParts: unknown[] = [];

  for (const arg of args) {
    if (arg instanceof Error) {
      if (!message) {
        message = arg.message;
      }

      stack = arg.stack;
      contextParts.push({
        name: arg.name,
        message: arg.message,
      });
      continue;
    }

    if (typeof arg === "string" && !message) {
      message = arg;
      continue;
    }

    if (isRecord(arg) && typeof arg.source === "string" && !source) {
      source = arg.source;
    }

    contextParts.push(arg);
  }

  if (!message) {
    if (contextParts.length === 1) {
      message =
        typeof contextParts[0] === "string"
          ? contextParts[0]
          : JSON.stringify(contextParts[0]);
      contextParts.length = 0;
    } else {
      message = "Log entry";
    }
  }

  let context: Prisma.InputJsonValue | undefined;

  if (contextParts.length === 1) {
    context = contextParts[0] as Prisma.InputJsonValue;
  } else if (contextParts.length > 1) {
    context = contextParts as Prisma.InputJsonValue;
  }

  return {
    message,
    context,
    stack,
    source,
  };
}

export async function createApplicationLog(
  level: AppLogLevel,
  args: unknown[]
) {
  const payload = normalizeLogArgs(args);

  return prisma.applicationLog.create({
    data: {
      level: level as LogLevel,
      message: payload.message,
      context: payload.context,
      stack: payload.stack,
      source: payload.source,
    },
  });
}

function buildLogWhere(filters: LogQueryFilters): Prisma.ApplicationLogWhereInput {
  const where: Prisma.ApplicationLogWhereInput = {};

  if (filters.level) {
    where.level = filters.level;
  }

  if (filters.source?.trim()) {
    where.source = {
      contains: filters.source.trim(),
      mode: "insensitive",
    };
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { message: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
      { stack: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};

    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  return where;
}

export async function queryApplicationLogs(filters: LogQueryFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;
  const where = buildLogWhere(filters);

  const [docs, total] = await Promise.all([
    prisma.applicationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.applicationLog.count({ where }),
  ]);

  return {
    docs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function deleteApplicationLog(id: string) {
  return prisma.applicationLog.delete({ where: { id } });
}

export async function clearApplicationLogs(options?: {
  level?: LogLevel;
  olderThanDays?: number;
  all?: boolean;
}) {
  const where: Prisma.ApplicationLogWhereInput = {};

  if (!options?.all) {
    if (options?.level) {
      where.level = options.level;
    }

    if (options?.olderThanDays && options.olderThanDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - options.olderThanDays);
      where.createdAt = { lt: cutoff };
    }
  }

  if (!options?.all && Object.keys(where).length === 0) {
    throw new Error("No clear criteria provided");
  }

  const result = await prisma.applicationLog.deleteMany({ where });

  return result.count;
}
