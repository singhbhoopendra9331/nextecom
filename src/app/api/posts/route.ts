export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        featuredImage: true,
        tags: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ docs: posts });
  } catch (error: unknown) {
    console.error("GET /api/posts:", error);
    const message =
      error && typeof error === "object" && "code" in error
        ? `Database error: ${(error as { code: string }).code}. Check DATABASE_URL and that the database exists.`
        : "Failed to fetch posts";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
