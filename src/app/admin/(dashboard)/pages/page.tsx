import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import PagesPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

export default async function Page() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.page.findMany({
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        featuredImage: {
          select: { id: true, url: true },
        },
      },
    }),
    prisma.page.count(),
  ]);

  const pages = {
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
      <PageTitle title="Pages" description="Manage your pages">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/pages/create">Add Page</Link>
        </Button>
      </PageTitle>
      <PagesPageClient initialData={pages} />
    </div>
  );
}
