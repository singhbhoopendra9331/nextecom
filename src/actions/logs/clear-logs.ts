"use server";

import { revalidatePath } from "next/cache";

import {
  clearApplicationLogs,
  deleteApplicationLog,
} from "@/lib/logs";
import type { AppLogLevel } from "@/lib/logs/constants";
import { LogLevel } from "@/generated/prisma/client";

export async function deleteLogAction(id: string) {
  try {
    await deleteApplicationLog(id);
    revalidatePath("/admin/logs");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("deleteLogAction", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete log",
    };
  }
}

export async function clearLogsAction(options: {
  all?: boolean;
  level?: AppLogLevel;
  olderThanDays?: number;
}) {
  try {
    const count = await clearApplicationLogs({
      all: options.all,
      level: options.level as LogLevel | undefined,
      olderThanDays: options.olderThanDays,
    });

    revalidatePath("/admin/logs");

    return { success: true as const, count };
  } catch (error: unknown) {
    console.error("clearLogsAction", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to clear logs",
    };
  }
}
