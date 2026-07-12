import {
  BackorderMode,
  CatalogVisibility,
  ProductStatus,
  ProductType,
  StockStatus,
} from "@/generated/prisma/client";
import { parseOptionalDecimal } from "@/lib/products/helpers";
import { toSlug } from "@/lib/products/slug";
import { sanitizeBlockContent } from "@/lib/sanitize-json-for-prisma";
import { InputJsonValue, JsonNullClass } from "@prisma/client/runtime/client";

export type ProductInput = {
  title: string;
  slug?: string;
  description?: unknown;
  shortDescription?: string | null;
  type?: ProductType;
  status?: ProductStatus;
  catalogVisibility?: CatalogVisibility;
  isFeatured?: boolean;
  menuOrder?: number;
  featuredImageId?: string | null;
  brandId?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  regularPrice?: string | number | null;
  salePrice?: string | number | null;
  costPrice?: string | number | null;
  taxClass?: string | null;
  currency?: string;
  sku?: string | null;
  manageStock?: boolean;
  quantity?: number;
  stockStatus?: StockStatus;
  allowBackorder?: BackorderMode;
  weight?: string | number | null;
  length?: string | number | null;
  width?: string | number | null;
  height?: string | number | null;
  enableReviews?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
};

export function buildSlug(title: string, slug?: string) {
  const base = slug?.trim() || toSlug(title);

  if (!base) {
    throw new Error("A valid slug is required");
  }

  return base;
}

export function buildProductData(data: ProductInput, slug: string) {
  return {
    title: data.title.trim(),
    slug,
    description: sanitizeBlockContent(data.description) as
      | JsonNullClass
      | InputJsonValue,
    shortDescription: data.shortDescription?.trim() || null,
    type: data.type ?? ProductType.SIMPLE,
    status: data.status ?? ProductStatus.DRAFT,
    catalogVisibility: data.catalogVisibility ?? CatalogVisibility.SHOP,
    isFeatured: data.isFeatured ?? false,
    menuOrder: data.menuOrder ?? 0,
    featuredImageId: data.featuredImageId ?? null,
    brandId: data.brandId ?? null,
    regularPrice: parseOptionalDecimal(data.regularPrice),
    salePrice: parseOptionalDecimal(data.salePrice),
    costPrice: parseOptionalDecimal(data.costPrice),
    taxClass: data.taxClass?.trim() || null,
    currency: data.currency?.trim() || "USD",
    sku: data.sku?.trim() || null,
    manageStock: data.manageStock ?? false,
    quantity: data.quantity ?? 0,
    stockStatus: data.stockStatus ?? StockStatus.IN_STOCK,
    allowBackorder: data.allowBackorder ?? BackorderMode.NO,
    weight: parseOptionalDecimal(data.weight),
    length: parseOptionalDecimal(data.length),
    width: parseOptionalDecimal(data.width),
    height: parseOptionalDecimal(data.height),
    enableReviews: data.enableReviews ?? true,
    metaTitle: data.metaTitle?.trim() || null,
    metaDescription: data.metaDescription?.trim() || null,
    canonicalUrl: data.canonicalUrl?.trim() || null,
    categories: data.categoryIds
      ? { connect: data.categoryIds.map((id) => ({ id })) }
      : undefined,
    tags: data.tagIds
      ? { connect: data.tagIds.map((id) => ({ id })) }
      : undefined,
  };
}
