export const LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const;

export type AppLogLevel = (typeof LOG_LEVELS)[number];

export const LOG_LEVEL_LABELS: Record<AppLogLevel, string> = {
  DEBUG: "Debug",
  INFO: "Info",
  WARN: "Warning",
  ERROR: "Error",
};
