import type { Prisma } from "@/generated/prisma/client";

export const RELATED_POSTS_META_KEY = "related_posts";

export function metaToRelatedPostIds(
  meta: { key: string; value: string }[]
): string[] {
  const value = meta.find((item) => item.key === RELATED_POSTS_META_KEY)?.value;

  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is string => typeof id === "string" && id.trim() !== ""
    );
  } catch {
    return [];
  }
}

export async function syncRelatedPostsMeta(
  tx: Prisma.TransactionClient,
  relatedPostIds: string[] | undefined,
  owner: { postId: string; excludePostId?: string }
) {
  const ids = (relatedPostIds ?? [])
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => id !== owner.excludePostId);

  await tx.meta.deleteMany({
    where: {
      postId: owner.postId,
      key: RELATED_POSTS_META_KEY,
    },
  });

  if (ids.length === 0) {
    return;
  }

  await tx.meta.create({
    data: {
      postId: owner.postId,
      key: RELATED_POSTS_META_KEY,
      value: JSON.stringify(ids),
    },
  });
}
