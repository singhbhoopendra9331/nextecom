import type { Prisma } from "@/generated/prisma/client";

import { serializeDecimal } from "@/lib/products/helpers";
import type { ProductListItem } from "@/lib/products/types";

type ProductListPayload = Prisma.ProductGetPayload<{
  include: {
    featuredImage: { select: { id: true; url: true } };
    brand: { select: { id: true; name: true } };
    categories: { select: { id: true; name: true } };
    tags: { select: { id: true; name: true } };
  };
}>;

export function serializeProductForClient(
  product: ProductListPayload
): ProductListItem {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    type: product.type,
    status: product.status,
    catalogVisibility: product.catalogVisibility,
    isFeatured: product.isFeatured,
    menuOrder: product.menuOrder,
    featuredImageId: product.featuredImageId,
    brandId: product.brandId,
    regularPrice: serializeDecimal(product.regularPrice),
    salePrice: serializeDecimal(product.salePrice),
    costPrice: serializeDecimal(product.costPrice),
    taxClass: product.taxClass,
    currency: product.currency,
    sku: product.sku,
    manageStock: product.manageStock,
    quantity: product.quantity,
    stockStatus: product.stockStatus,
    allowBackorder: product.allowBackorder,
    weight: serializeDecimal(product.weight),
    length: serializeDecimal(product.length),
    width: serializeDecimal(product.width),
    height: serializeDecimal(product.height),
    enableReviews: product.enableReviews,
    averageRating: serializeDecimal(product.averageRating),
    ratingCount: product.ratingCount,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    canonicalUrl: product.canonicalUrl,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    featuredImage: product.featuredImage,
    brand: product.brand,
    categories: product.categories,
    tags: product.tags,
  };
}
