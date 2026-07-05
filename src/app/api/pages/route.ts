import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";

export async function GET(req: NextRequest) {
  const auth = await requireApiPermission("pages:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = req.nextUrl;

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

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
