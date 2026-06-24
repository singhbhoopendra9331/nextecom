import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getGlobalSettings } from "@/lib/settings";

import PageClient from "./page.client";

const getPageBySlug = async ({ slug }: { slug: string }) => {
  return prisma.page.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
    include: {
      featuredImage: {
        select: { id: true, url: true, originalName: true },
      },
      meta: true,
    },
  });
};

type PageRecord = NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>;

async function buildMetadata(page: PageRecord | null): Promise<Metadata> {
  const globalSettings = await getGlobalSettings();

  if (!page) {
    return {
      title: globalSettings.siteTitle,
      description: globalSettings.siteTagline || undefined,
    };
  }

  const description =
    page.meta.find((item) => item.key === "description")?.value ??
    page.meta.find((item) => item.key === "meta_description")?.value ??
    globalSettings.siteTagline;

  return {
    title: page.title,
    description: description || undefined,
    openGraph: page.featuredImage?.url
      ? { images: [{ url: page.featuredImage.url }] }
      : undefined,
  };
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = "home" } = await paramsPromise;
  const page = await getPageBySlug({ slug });

  if (!page) {
    notFound();
  }

  return (
    <PageClient
      page={{
        title: page.title,
        content: page.content,
        featuredImage: page.featuredImage,
      }}
    />
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = "home" } = await paramsPromise;
  const page = await getPageBySlug({ slug });

  return buildMetadata(page);
}
