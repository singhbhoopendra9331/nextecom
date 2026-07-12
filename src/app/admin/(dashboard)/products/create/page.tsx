import ProductForm from "@/components/admin/product-form";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

export const metadata = createAdminMetadata(
  "Create Product",
  "Add a new product."
);

export default async function CreateProductPage() {
  const [categories, tags, brands] = await Promise.all([
    prisma.productCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.productTag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ProductForm
      mode="create"
      categories={categories}
      tags={tags}
      brands={brands}
    />
  );
}
