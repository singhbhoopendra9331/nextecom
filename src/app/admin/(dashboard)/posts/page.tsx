import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata("Posts", "Manage your posts.");

export default async function Page() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true },
        },
        featuredImage: true,
        tags: true,
        categories: true,
        meta: true,
      },
    }),
    prisma.post.count(),
  ]);

  const posts = {
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Posts" description="Manage your posts">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/posts/create">Add Post</Link>
        </Button>
      </PageTitle>

      <PostPageClient initialData={posts} />
    </div>
  );
}
