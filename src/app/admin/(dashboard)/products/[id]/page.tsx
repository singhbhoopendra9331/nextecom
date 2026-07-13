import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ProductForm from "@/components/admin/product-form";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { mapProductToFormValues } from "@/lib/products/map-product-form";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!product) {
    return createAdminMetadata("Edit Product", "Edit a product.");
  }

  return createAdminMetadata(
    `Edit Product: ${product.title}`,
    `Edit "${product.title}".`
  );
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, tags, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        featuredImage: true,
        categories: { select: { id: true } },
        tags: { select: { id: true } },
      },
    }),
    prisma.category.findMany({
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

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      categories={categories}
      tags={tags}
      brands={brands}
      initialValues={mapProductToFormValues({
        ...product,
        featuredImage: product.featuredImage
          ? {
              id: product.featuredImage.id,
              url: product.featuredImage.url,
              originalName: product.featuredImage.originalName,
            }
          : null,
      })}
    />
  );
}
