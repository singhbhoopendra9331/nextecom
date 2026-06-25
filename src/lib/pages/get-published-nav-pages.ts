import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { SiteNavLink } from "@/lib/navigation/site-nav";

export async function getPublishedNavPages(): Promise<SiteNavLink[]> {
  const pages = await prisma.page.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      slug: { not: "home" },
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
