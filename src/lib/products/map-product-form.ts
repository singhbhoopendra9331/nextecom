import { decimalToString } from "@/lib/products/helpers";
import type { ProductFormInitialValues } from "@/lib/products/types";

export function mapProductToFormValues(product: {
  title: string;
  slug: string;
  description: unknown;
  shortDescription: string | null;
  type: ProductFormInitialValues["type"];
  status: ProductFormInitialValues["status"];
  catalogVisibility: ProductFormInitialValues["catalogVisibility"];
  isFeatured: boolean;
  menuOrder: number;
  featuredImageId: string | null;
  featuredImage?: ProductFormInitialValues["featuredImage"];
  brandId: string | null;
  categories: { id: string }[];
  tags: { id: string }[];
  regularPrice: { toString(): string } | null;
  salePrice: { toString(): string } | null;
  costPrice: { toString(): string } | null;
  taxClass: string | null;
  currency: string;
  sku: string | null;
  manageStock: boolean;
  quantity: number;
  stockStatus: NonNullable<ProductFormInitialValues["stockStatus"]>;
  allowBackorder: NonNullable<ProductFormInitialValues["allowBackorder"]>;
  weight: { toString(): string } | null;
  length: { toString(): string } | null;
  width: { toString(): string } | null;
  height: { toString(): string } | null;
  enableReviews: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
}): ProductFormInitialValues {
  return {
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
    featuredImage: product.featuredImage ?? null,
    brandId: product.brandId,
    categoryIds: product.categories.map((category) => category.id),
    tagIds: product.tags.map((tag) => tag.id),
    regularPrice: decimalToString(product.regularPrice),
    salePrice: decimalToString(product.salePrice),
    costPrice: decimalToString(product.costPrice),
    taxClass: product.taxClass,
    currency: product.currency,
    sku: product.sku,
    manageStock: product.manageStock,
    quantity: product.quantity,
    stockStatus: product.stockStatus,
    allowBackorder: product.allowBackorder,
    weight: decimalToString(product.weight),
    length: decimalToString(product.length),
    width: decimalToString(product.width),
    height: decimalToString(product.height),
    enableReviews: product.enableReviews,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    canonicalUrl: product.canonicalUrl,
  };
}
