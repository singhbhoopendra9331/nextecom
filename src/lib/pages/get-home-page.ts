import { PostStatus } from "@/generated/prisma/client";
import { resolveSeoDescription, resolveSeoTitle } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { getReadingSettings } from "@/lib/settings";

const pageInclude = {
  featuredImage: {
    select: { id: true, url: true, originalName: true },
  },
  meta: true,
} as const;

export async function getHomePage() {
  const reading = await getReadingSettings();

  if (reading.homepagePageId) {
    const selectedPage = await prisma.page.findFirst({
      where: {
        id: reading.homepagePageId,
        status: PostStatus.PUBLISHED,
      },
      include: pageInclude,
    });

    if (selectedPage) {
      return selectedPage;
    }
  }

  return prisma.page.findFirst({
    where: {
      slug: "home",
      status: PostStatus.PUBLISHED,
    },
    include: pageInclude,
  });
}

export async function getHomepageSlug() {
  const page = await getHomePage();
  return page?.slug ?? "home";
}

export async function buildHomePageMetadata() {
  const page = await getHomePage();
  const { getGlobalSettings } = await import("@/lib/settings");
  const globalSettings = await getGlobalSettings();

  if (!page) {
    return {
      title: globalSettings.siteTitle,
      description: globalSettings.siteTagline || undefined,
    };
  }

  const description = resolveSeoDescription(
    page.meta,
    globalSettings.siteTagline
  );

  return {
    title: resolveSeoTitle(page.meta, page.title),
    description: description || undefined,
    openGraph: page.featuredImage?.url
      ? { images: [{ url: page.featuredImage.url }] }
      : undefined,
  };
}
