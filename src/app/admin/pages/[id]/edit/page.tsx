import { notFound } from "next/navigation";

import PageForm from "@/components/page-form";
import { prisma } from "@/lib/prisma";

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
      }}
    />
  );
}
