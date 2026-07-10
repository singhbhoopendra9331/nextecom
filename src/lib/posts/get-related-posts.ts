import { PostStatus } from "@/generated/prisma/client";
import { metaToRelatedPostIds } from "@/lib/meta/related-posts";
import { prisma } from "@/lib/prisma";

export type RelatedPostSummary = {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  author?: { id: string; name: string | null } | null;
  featuredImage?: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  categories?: { name: string }[];
};

export async function getRelatedPosts(
  meta: { key: string; value: string }[],
  options?: { currentPostId?: string }
): Promise<RelatedPostSummary[]> {
  const ids = metaToRelatedPostIds(meta).filter(
    (id) => id !== options?.currentPostId
  );

  if (ids.length === 0) {
    return [];
  }

  const posts = await prisma.post.findMany({
    where: {
      id: { in: ids },
      status: PostStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      author: {
        select: { id: true, name: true },
      },
      featuredImage: {
        select: { id: true, url: true, originalName: true },
      },
      categories: {
        select: { name: true },
      },
    },
  });

  const postMap = new Map(posts.map((post) => [post.id, post]));

  return ids.flatMap((id) => {
    const post = postMap.get(id);
    return post ? [post] : [];
  });
}
