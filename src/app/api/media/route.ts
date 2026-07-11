import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";

export async function GET(req: Request) {
  const auth = await requireApiPermission("media:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);

    const { page, limit, skip } = parsePaginationParams(
      searchParams.get("page"),
      searchParams.get("limit")
    );
    const q = searchParams.get("q") || "";

    const where = q
      ? {
        OR: [
          { filename: { contains: q, mode: "insensitive" as const } },
          { originalName: { contains: q, mode: "insensitive" as const } },
        ],
      }
      : {};

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      docs: media,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/media:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch media" },
      { status: 500 }
    );
  }
}

