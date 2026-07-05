import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import MediaPageClient from "./page.client";

export default async function Page() {
  const page = 1;
  const limit = 20;
  const q = "";
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { filename: { contains: q, mode: "insensitive" as const } },
          { originalName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [docs, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  const initialData = {
    docs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Media" description="Manage your media">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/media/create">Add Media</Link>
        </Button>
      </PageTitle>

      <MediaPageClient initialData={initialData} />
    </div>
  );
}
