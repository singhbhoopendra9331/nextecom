import PostForm from "@/components/admin/post-form";
import { prisma } from "@/lib/prisma";

export default async function CreatePostPage() {
  const [tags, categories] = await Promise.all([
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <PostForm mode="create" tags={tags} categories={categories} />;
}
