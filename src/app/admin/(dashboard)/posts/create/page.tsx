import PostForm from "@/components/admin/post-form";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

export const metadata = createAdminMetadata("Create Post", "Add a new blog post.");

export default async function CreatePostPage() {
  const [tags, categories, posts] = await Promise.all([
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.post.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <PostForm
      mode="create"
      tags={tags}
      categories={categories}
      posts={posts.map((post) => ({ id: post.id, name: post.title }))}
    />
  );
}
