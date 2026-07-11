import { queryApplicationLogs } from "@/lib/logs";
import { LogLevel } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { NextResponse } from "next/server";

const LOG_LEVELS = new Set<string>(Object.values(LogLevel));

export async function GET(req: Request) {
  const auth = await requireApiPermission("logs:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);

    const { page, limit } = parsePaginationParams(
      searchParams.get("page"),
      searchParams.get("limit")
    );
    const q = searchParams.get("q") || "";
    const source = searchParams.get("source") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const levelParam = searchParams.get("level") || "";
    const level = LOG_LEVELS.has(levelParam)
      ? (levelParam as LogLevel)
      : undefined;

    const data = await queryApplicationLogs({
      page,
      limit,
      q,
      source,
      dateFrom,
      dateTo,
      level,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("GET /api/logs:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch logs",
      },
      { status: 500 }
    );
  }
}
