import { Prisma } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireApiPermission("pages:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = req.nextUrl;

  const { page, limit, skip } = parsePaginationParams(
    searchParams.get("page"),
    searchParams.get("limit")
  );
  const search = searchParams.get("search") || "";

  const where: Prisma.PageWhereInput = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [docs, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        featuredImage: {
          select: { id: true, url: true },
        },
        meta: true,
      },
    }),
    prisma.page.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return NextResponse.json({
    docs,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  });
}
