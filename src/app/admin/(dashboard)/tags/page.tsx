import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";

import TagsPageClient from "./page.client";

export const metadata = createAdminMetadata("Tags", "Manage post tags.");

export default async function Page() {
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialTags = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    postCount: tag._count.posts,
  }));

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Tags" description="Manage your tags" />
      <TagsPageClient initialTags={initialTags} />
    </div>
  );
}
