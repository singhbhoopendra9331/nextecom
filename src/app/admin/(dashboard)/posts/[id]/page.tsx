import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import PostForm from "@/components/admin/post-form";

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
      }}
    />
  );
}
