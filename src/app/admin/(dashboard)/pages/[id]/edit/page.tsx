import { notFound } from "next/navigation";
import type { Metadata } from "next";

import PageForm from "@/components/admin/page-form";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { metaToSeo } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!page) {
    return createAdminMetadata("Edit Page", "Edit a site page.");
  }

  return createAdminMetadata(`Edit Page: ${page.title}`, `Edit "${page.title}".`);
}

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      featuredImage: true,
      meta: true,
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <PageForm
      mode="edit"
      pageId={page.id}
      initialValues={{
        title: page.title,
        content: page.content,
        status: page.status,
        featuredImageId: page.featuredImageId,
        featuredImage: page.featuredImage
          ? {
              id: page.featuredImage.id,
              url: page.featuredImage.url,
              originalName: page.featuredImage.originalName,
            }
          : null,
        seo: metaToSeo(page.meta),
      }}
    />
  );
}
