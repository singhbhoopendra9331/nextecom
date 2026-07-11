import { PostStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { NextResponse } from "next/server";

const POST_STATUSES = new Set<string>(Object.values(PostStatus));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const { page, limit, skip } = parsePaginationParams(
    searchParams.get("page"),
    searchParams.get("limit")
  );
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const status = POST_STATUSES.has(statusParam)
    ? (statusParam as PostStatus)
    : undefined;

  if (status !== PostStatus.PUBLISHED) {
    const auth = await requireApiPermission("posts:read");
    if (auth.response) {
      return auth.response;
    }
  }

  const where: Prisma.PostWhereInput = {
    ...(status ? { status } : {}),
    ...(search
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
      : {}),
  };

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
        meta: true,
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