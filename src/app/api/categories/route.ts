import { Prisma } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await requireApiPermission("posts:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.CategoryWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.count({ where }),
  ]);

  const docs = categories.map((category) => ({
    id: category.id,
    name: category.name,
    postCount: category._count.posts,
  }));

  return NextResponse.json({
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
