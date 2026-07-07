import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";

import CategoriesPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Categories",
  "Manage post categories."
);

export default async function Page() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    postCount: category._count.posts,
  }));

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Categories" description="Manage your categories" />
      <CategoriesPageClient initialCategories={initialCategories} />
    </div>
  );
}
