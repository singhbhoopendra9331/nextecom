import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { metaToSeo } from "@/lib/meta/seo";

import PostForm from "@/components/admin/post-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!post) {
    return createAdminMetadata("Edit Post", "Edit a blog post.");
  }

  return createAdminMetadata(`Edit Post: ${post.title}`, `Edit "${post.title}".`);
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, tags, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        featuredImage: true,
        tags: { select: { id: true } },
        categories: { select: { id: true } },
        meta: true,
      },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      mode="edit"
      postId={post.id}
      tags={tags}
      categories={categories}
      initialValues={{
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        status: post.status,
        featuredImageId: post.featuredImageId,
        featuredImage: post.featuredImage
          ? {
              id: post.featuredImage.id,
              url: post.featuredImage.url,
              originalName: post.featuredImage.originalName,
            }
          : null,
        tagIds: post.tags.map((tag) => tag.id),
        categoryIds: post.categories.map((category) => category.id),
        seo: metaToSeo(post.meta),
      }}
    />
  );
}
