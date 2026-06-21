import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const q = searchParams.get("q") || "";

    const skip = (page - 1) * limit;

    const where = q
      ? {
        OR: [
          { filename: { contains: q, mode: "insensitive" } },
          { originalName: { contains: q, mode: "insensitive" } },
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

