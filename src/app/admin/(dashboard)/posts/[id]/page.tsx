import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import PostForm from "@/components/admin/post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      featuredImage: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      mode="edit"
      postId={post.id}
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
      }}
    />
  );
}
