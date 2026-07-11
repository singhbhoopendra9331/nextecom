import { CommentStatus, Prisma } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COMMENT_STATUSES = new Set<string>(Object.values(CommentStatus));

export async function GET(req: Request) {
  const auth = await requireApiPermission("comments:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const postId = searchParams.get("postId") || "";
  const status = COMMENT_STATUSES.has(statusParam)
    ? (statusParam as CommentStatus)
    : undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.CommentWhereInput = {
    ...(status ? { status } : {}),
    ...(postId ? { postId } : {}),
    ...(search
      ? {
          OR: [
            {
              content: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              authorName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              authorEmail: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              post: {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  try {
    const [docs, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          status: true,
          authorName: true,
          authorEmail: true,
          authorUrl: true,
          postId: true,
          parentId: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          post: {
            select: {
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      docs: docs.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/comments", error);

    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
