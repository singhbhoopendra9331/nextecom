import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
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
      meta: true,
    },
  });
}
