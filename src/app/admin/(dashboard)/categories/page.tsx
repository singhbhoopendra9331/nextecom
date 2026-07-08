import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

import CategoriesPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Categories",
  "Manage post categories."
);

export default async function Page() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.count(),
  ]);

  const initialData = {
    docs: categories.map((category) => ({
      id: category.id,
      name: category.name,
      postCount: category._count.posts,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  return (
    <div className="min-h-screen space-y-6 p-2 md:p-4">
      <PageTitle title="Categories" description="Manage your categories" />
      <CategoriesPageClient initialData={initialData} />
    </div>
  );
}
