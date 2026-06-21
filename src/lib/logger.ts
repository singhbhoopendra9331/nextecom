import type { AppLogLevel } from "@/lib/logs/constants";

const isDev = process.env.NODE_ENV === "development";

const formatData = (data: unknown) => {
  if (data instanceof Error) {
    return {
      message: data.message,
      stack: data.stack,
    };
  }

  if (typeof data === "object" && data !== null) {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return data;
    }
  }

  return data;
};

function writeToConsole(
  level: AppLogLevel,
  prefix: string,
  args: unknown[]
) {
  const formatted = args.map(formatData);

  switch (level) {
    case "ERROR":
      console.error(prefix, ...formatted);
      break;
    case "WARN":
      console.warn(prefix, ...formatted);
      break;
    case "DEBUG":
      console.debug(prefix, ...formatted);
      break;
    default:
      console.log(prefix, ...formatted);
  }
}

function persistLog(level: AppLogLevel, args: unknown[]) {
  if (typeof window !== "undefined") {
    return;
  }

  void import("@/lib/logs")
    .then(({ createApplicationLog }) => createApplicationLog(level, args))
    .catch((error) => {
      console.error("[logger] Failed to persist log:", error);
    });
}

function logWithLevel(level: AppLogLevel, prefix: string, args: unknown[]) {
  if (isDev) {
    writeToConsole(level, prefix, args);
  }

  persistLog(level, args);
}

export const logger = {
  debug: (...args: unknown[]) => {
    logWithLevel("DEBUG", "[DEBUG]", args);
  },

  log: (...args: unknown[]) => {
    logWithLevel("INFO", "[LOG]", args);
  },

  info: (...args: unknown[]) => {
    logWithLevel("INFO", "[INFO]", args);
  },

  warn: (...args: unknown[]) => {
    logWithLevel("WARN", "[WARN]", args);
  },

  error: (...args: unknown[]) => {
    logWithLevel("ERROR", "[ERROR]", args);
  },
};
