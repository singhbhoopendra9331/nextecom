import Link from "next/link";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

import FormsPageClient from "./page.client";

export const metadata = createAdminMetadata("Forms", "Manage your forms.");

export default async function FormsPage() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.form.findMany({
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
    prisma.form.count(),
  ]);

  return (
    <div className="min-h-screen space-y-6 p-2 md:p-4">
      <PageTitle title="Forms" description="Manage your forms">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/forms/create">Add Form</Link>
        </Button>
      </PageTitle>
      <FormsPageClient
        initialData={{
          docs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }}
      />
    </div>
  );
}
