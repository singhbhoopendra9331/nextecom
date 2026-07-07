import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getHomepageSlug } from "@/lib/pages/get-home-page";

import type { SiteNavLink } from "@/lib/navigation/site-nav";

export async function getPublishedNavPages(): Promise<SiteNavLink[]> {
  const homepageSlug = await getHomepageSlug();

  const pages = await prisma.page.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      slug: { not: homepageSlug },
    },
    select: {
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

  return pages.map((page) => ({
    title: page.title,
    href: `/${page.slug}`,
  }));
}
