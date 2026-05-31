import { getEnv } from "@/lib/env";

/** Reusable environment-based logger */

const isDev = getEnv("NODE_ENV") === "development";

const formatData = (data: any) => {
  if (data instanceof Error) {
    return {
      message: data.message,
      stack: data.stack,
    };
  }

  if (typeof data === "object") {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return data;
    }
  }

  return data;
};

export const logger = {
  log: (...args: any[]) => {
    if (!isDev) return;

    console.log(
      "[LOG]",
      ...args.map(formatData)
    );
  },

  error: (...args: any[]) => {
    if (!isDev) return;

    console.error(
      "[ERROR]",
      ...args.map(formatData)
    );
  },

  warn: (...args: any[]) => {
    if (!isDev) return;

    console.warn(
      "[WARN]",
      ...args.map(formatData)
    );
  },
};