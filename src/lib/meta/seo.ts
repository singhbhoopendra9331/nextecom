import type { Prisma } from "@/generated/prisma/client";

export type SeoInput = {
  title?: string;
  description?: string;
};

export const SEO_META_KEYS = {
  title: "seo_title",
  description: "description",
} as const;

const MANAGED_SEO_KEYS = [
  SEO_META_KEYS.title,
  SEO_META_KEYS.description,
  "meta_description",
] as const;

export function metaToSeo(
  meta: { key: string; value: string }[]
): SeoInput {
  return {
    title: meta.find((item) => item.key === SEO_META_KEYS.title)?.value ?? "",
    description:
      meta.find((item) => item.key === SEO_META_KEYS.description)?.value ??
      meta.find((item) => item.key === "meta_description")?.value ??
      "",
  };
}

export async function syncSeoMeta(
  tx: Prisma.TransactionClient,
  seo: SeoInput | undefined,
  owner: { postId: string } | { pageId: string }
) {
  const ownerFilter =
    "postId" in owner ? { postId: owner.postId } : { pageId: owner.pageId };

  await tx.meta.deleteMany({
    where: {
      ...ownerFilter,
      key: { in: [...MANAGED_SEO_KEYS] },
    },
  });

  const entries: { key: string; value: string }[] = [];

  const title = seo?.title?.trim();
  const description = seo?.description?.trim();

  if (title) {
    entries.push({ key: SEO_META_KEYS.title, value: title });
  }

  if (description) {
    entries.push({ key: SEO_META_KEYS.description, value: description });
  }

  if (entries.length === 0) {
    return;
  }

  await tx.meta.createMany({
    data: entries.map((entry) => ({
      key: entry.key,
      value: entry.value,
      ...ownerFilter,
    })),
  });
}

export function resolveSeoTitle(
  meta: { key: string; value: string }[],
  fallback: string
) {
  const seoTitle = meta.find((item) => item.key === SEO_META_KEYS.title)?.value;
  return seoTitle?.trim() || fallback;
}

export function resolveSeoDescription(
  meta: { key: string; value: string }[],
  fallback?: string
) {
  const description =
    meta.find((item) => item.key === SEO_META_KEYS.description)?.value ??
    meta.find((item) => item.key === "meta_description")?.value;

  return description?.trim() || fallback;
}
