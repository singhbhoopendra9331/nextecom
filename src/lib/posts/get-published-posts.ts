import { PostStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { BLOGS_PER_PAGE } from "./blog-paths";

type GetPublishedPostsArgs = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getPublishedPosts({
  page = 1,
  limit = BLOGS_PER_PAGE,
  search = "",
}: GetPublishedPostsArgs = {}) {
  const skip = (page - 1) * limit;
  const trimmedSearch = search.trim();

  const where: Prisma.PostWhereInput = {
    status: PostStatus.PUBLISHED,
    ...(trimmedSearch
      ? {
          OR: [
            {
              title: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: trimmedSearch,
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
        featuredImage: {
          select: { id: true, url: true, originalName: true },
        },
        tags: {
          select: { name: true },
        },
        categories: {
          select: { name: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
