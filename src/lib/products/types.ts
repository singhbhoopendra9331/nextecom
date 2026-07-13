import type {
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

export type ProductListItem = {
  id: string;
  title: string;
  slug: string;
  description: unknown;
  shortDescription: string | null;
  type: ProductType;
  status: ProductStatus;
  catalogVisibility: CatalogVisibility;
  isFeatured: boolean;
  menuOrder: number;
  featuredImageId: string | null;
  brandId: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  costPrice: string | null;
  taxClass: string | null;
  currency: string;
  sku: string | null;
  manageStock: boolean;
  quantity: number;
  stockStatus: StockStatus;
  allowBackorder: BackorderMode;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  enableReviews: boolean;
  averageRating: string | null;
  ratingCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  featuredImage?: { id: string; url: string } | null;
  brand?: { id: string; name: string } | null;
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
};
