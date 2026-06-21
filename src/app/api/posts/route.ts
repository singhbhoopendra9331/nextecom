import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.PostWhereInput = search
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
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true },
        },
        featuredImage: true,
        tags: true,
        categories: true,
      },
    }),
    prisma.post.count({ where }),
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