import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

import ProductPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Products",
  "Manage your products."
);

export default async function Page() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        featuredImage: {
          select: { id: true, url: true },
        },
        brand: {
          select: { id: true, name: true },
        },
        categories: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.product.count(),
  ]);

  const products = {
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
      <PageTitle title="Products" description="Manage your products">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/products/create">Add Product</Link>
        </Button>
      </PageTitle>

      <ProductPageClient initialData={products} />
    </div>
  );
}
