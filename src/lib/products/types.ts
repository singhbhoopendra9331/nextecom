import {
  BackorderMode,
  CatalogVisibility,
  ProductStatus,
  ProductType,
  StockStatus,
} from "@/generated/prisma/enums";

type FeaturedImage = {
  id: string;
  url: string;
  originalName: string;
};

export type ProductFormInitialValues = {
  title?: string;
  slug?: string;
  description?: unknown;
  shortDescription?: string | null;
  type?: ProductType;
  status?: ProductStatus;
  catalogVisibility?: CatalogVisibility;
  isFeatured?: boolean;
  menuOrder?: number;
  featuredImageId?: string | null;
  featuredImage?: FeaturedImage | null;
  brandId?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  regularPrice?: string;
  salePrice?: string;
  costPrice?: string;
  taxClass?: string | null;
  currency?: string;
  sku?: string | null;
  manageStock?: boolean;
  quantity?: number;
  stockStatus?: StockStatus;
  allowBackorder?: BackorderMode;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  enableReviews?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
};
