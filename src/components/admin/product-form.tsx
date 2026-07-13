"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createProduct } from "@/actions/products/create-product";
import { updateProduct } from "@/actions/products/update-product";
import Editor from "@/components/editor";
import {
  CheckboxField,
  MultiSelectField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { type SelectOption } from "@/components/select";
import { Button } from "@/components/ui/button";
import {
  BackorderMode,
  CatalogVisibility,
  ProductStatus,
  ProductType,
  StockStatus,
} from "@/generated/prisma/enums";
import { toSlug } from "@/lib/products/slug";
import type { ProductFormInitialValues } from "@/lib/products/types";
import { toast } from "@/lib/toast";

type FeaturedImage = {
  id: string;
  url: string;
  originalName: string;
};

type TaxonomyOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormInitialValues;
  categories?: TaxonomyOption[];
  tags?: TaxonomyOption[];
  brands?: TaxonomyOption[];
};

const NO_BRAND_VALUE = "__none__";

const typeOptions: SelectOption[] = [
  { value: ProductType.SIMPLE, label: "Simple" },
  { value: ProductType.VARIABLE, label: "Variable" },
  { value: ProductType.AFFILIATE, label: "Affiliate" },
];

const statusOptions: SelectOption[] = [
  { value: ProductStatus.DRAFT, label: "Draft" },
  { value: ProductStatus.PENDING, label: "Pending" },
  { value: ProductStatus.PRIVATE, label: "Private" },
  { value: ProductStatus.PUBLISHED, label: "Published" },
];

const visibilityOptions: SelectOption[] = [
  { value: CatalogVisibility.SHOP, label: "Shop" },
  { value: CatalogVisibility.SEARCH, label: "Search" },
  { value: CatalogVisibility.HIDDEN, label: "Hidden" },
];

const stockStatusOptions: SelectOption[] = [
  { value: StockStatus.IN_STOCK, label: "In stock" },
  { value: StockStatus.OUT_OF_STOCK, label: "Out of stock" },
  { value: StockStatus.ON_BACKORDER, label: "On backorder" },
];

const backorderOptions: SelectOption[] = [
  { value: BackorderMode.NO, label: "Do not allow" },
  { value: BackorderMode.NOTIFY, label: "Allow, but notify customer" },
  { value: BackorderMode.YES, label: "Allow" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold border-b pb-2">{children}</h3>;
}

export default function ProductForm({
  mode,
  productId,
  initialValues,
  categories = [],
  tags = [],
  brands = [],
}: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [description, setDescription] = useState<unknown>(
    initialValues?.description ?? null
  );
  const [shortDescription, setShortDescription] = useState(
    initialValues?.shortDescription ?? ""
  );
  const [type, setType] = useState<ProductType>(
    initialValues?.type ?? ProductType.SIMPLE
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialValues?.status ?? ProductStatus.DRAFT
  );
  const [catalogVisibility, setCatalogVisibility] = useState<CatalogVisibility>(
    initialValues?.catalogVisibility ?? CatalogVisibility.SHOP
  );
  const [isFeatured, setIsFeatured] = useState(
    initialValues?.isFeatured ?? false
  );
  const [menuOrder, setMenuOrder] = useState(
    String(initialValues?.menuOrder ?? 0)
  );
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(
    initialValues?.featuredImageId ?? null
  );
  const [featuredImage, setFeaturedImage] = useState<FeaturedImage | null>(
    initialValues?.featuredImage ?? null
  );
  const [brandId, setBrandId] = useState(
    initialValues?.brandId ?? NO_BRAND_VALUE
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialValues?.categoryIds ?? []
  );
  const [tagIds, setTagIds] = useState<string[]>(initialValues?.tagIds ?? []);
  const [regularPrice, setRegularPrice] = useState(
    initialValues?.regularPrice ?? ""
  );
  const [salePrice, setSalePrice] = useState(initialValues?.salePrice ?? "");
  const [costPrice, setCostPrice] = useState(initialValues?.costPrice ?? "");
  const [taxClass, setTaxClass] = useState(initialValues?.taxClass ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "USD");
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [manageStock, setManageStock] = useState(
    initialValues?.manageStock ?? false
  );
  const [quantity, setQuantity] = useState(
    String(initialValues?.quantity ?? 0)
  );
  const [stockStatus, setStockStatus] = useState<StockStatus>(
    initialValues?.stockStatus ?? StockStatus.IN_STOCK
  );
  const [allowBackorder, setAllowBackorder] = useState<BackorderMode>(
    initialValues?.allowBackorder ?? BackorderMode.NO
  );
  const [weight, setWeight] = useState(initialValues?.weight ?? "");
  const [length, setLength] = useState(initialValues?.length ?? "");
  const [width, setWidth] = useState(initialValues?.width ?? "");
  const [height, setHeight] = useState(initialValues?.height ?? "");
  const [enableReviews, setEnableReviews] = useState(
    initialValues?.enableReviews ?? true
  );
  const [metaTitle, setMetaTitle] = useState(initialValues?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialValues?.metaDescription ?? ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    initialValues?.canonicalUrl ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ value: tag.id, label: tag.name })),
    [tags]
  );

  const brandOptions = useMemo<SelectOption[]>(
    () => [
      { value: NO_BRAND_VALUE, label: "No brand" },
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ],
    [brands]
  );

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(toSlug(title));
    }
  }, [title, slugTouched]);

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      slug,
      description,
      shortDescription,
      type,
      status,
      catalogVisibility,
      isFeatured,
      menuOrder: Number.parseInt(menuOrder, 10) || 0,
      featuredImageId,
      brandId: brandId === NO_BRAND_VALUE ? null : brandId,
      categoryIds,
      tagIds,
      regularPrice,
      salePrice,
      costPrice,
      taxClass,
      currency,
      sku,
      manageStock,
      quantity: Number.parseInt(quantity, 10) || 0,
      stockStatus,
      allowBackorder,
      weight,
      length,
      width,
      height,
      enableReviews,
      metaTitle,
      metaDescription,
      canonicalUrl,
    };

    const res =
      mode === "edit" && productId
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create"
          ? "Product created successfully"
          : "Product updated successfully"
      );
      router.push("/admin/products");
      return;
    }

    toast.error(res.error ?? "Something went wrong");
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">
          {mode === "create" ? "Create Product" : "Edit Product"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-12 gap-4"
        noValidate
      >
        <input
          type="hidden"
          name="featuredImageId"
          value={featuredImageId ?? ""}
          readOnly
        />

        <div className="col-span-12 md:col-span-8 space-y-6 border-r pr-4">
          <div className="space-y-4">
            <TextField
              label="Title"
              name="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Product title"
            />

            <TextField
              label="Slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="product-slug"
            />

            <TextareaField
              label="Short description"
              name="shortDescription"
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="Brief summary shown in listings"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Editor
                key={productId ?? "new-product"}
                onChange={setDescription}
                initialContent={initialValues?.description}
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading>Pricing</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Regular price"
                name="regularPrice"
                type="number"
                min="0"
                step="0.01"
                value={regularPrice}
                onChange={(event) => setRegularPrice(event.target.value)}
              />
              <TextField
                label="Sale price"
                name="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
              />
              <TextField
                label="Cost price"
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
              />
              <TextField
                label="Tax class"
                name="taxClass"
                value={taxClass}
                onChange={(event) => setTaxClass(event.target.value)}
                placeholder="standard"
              />
              <TextField
                label="Currency"
                name="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                placeholder="USD"
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading>Inventory</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="SKU"
                name="sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="SKU-001"
              />
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={!manageStock}
              />
            </div>

            <CheckboxField
              label="Manage stock"
              name="manageStock"
              checked={manageStock}
              onCheckedChange={setManageStock}
            />

            <SelectField
              label="Stock status"
              name="stockStatus"
              options={stockStatusOptions}
              value={stockStatus}
              onValueChange={(value) => setStockStatus(value as StockStatus)}
            />

            <SelectField
              label="Allow backorders"
              name="allowBackorder"
              options={backorderOptions}
              value={allowBackorder}
              onValueChange={(value) =>
                setAllowBackorder(value as BackorderMode)
              }
            />
          </div>

          <div className="space-y-4">
            <SectionHeading>Shipping</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <TextField
                label="Weight"
                name="weight"
                type="number"
                min="0"
                step="0.001"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <TextField
                label="Length"
                name="length"
                type="number"
                min="0"
                step="0.01"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
              <TextField
                label="Width"
                name="width"
                type="number"
                min="0"
                step="0.01"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
              <TextField
                label="Height"
                name="height"
                type="number"
                min="0"
                step="0.01"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-4">

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Save Product"
                  : "Update Product"}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Featured image
            </label>
            <MediaPicker
              value={featuredImage}
              onChange={(media) => {
                setFeaturedImage(media);
                setFeaturedImageId(media?.id ?? null);
              }}
            />
          </div>

          <SelectField
            label="Product type"
            name="type"
            options={typeOptions}
            value={type}
            onValueChange={(value) => setType(value as ProductType)}
          />

          <SelectField
            label="Status"
            name="status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value as ProductStatus)}
          />

          <SelectField
            label="Catalog visibility"
            name="catalogVisibility"
            options={visibilityOptions}
            value={catalogVisibility}
            onValueChange={(value) =>
              setCatalogVisibility(value as CatalogVisibility)
            }
          />

          <CheckboxField
            label="Featured product"
            name="isFeatured"
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />

          <TextField
            label="Menu order"
            name="menuOrder"
            type="number"
            value={menuOrder}
            onChange={(event) => setMenuOrder(event.target.value)}
          />

          <SelectField
            label="Brand"
            name="brandId"
            options={brandOptions}
            value={brandId || NO_BRAND_VALUE}
            onValueChange={setBrandId}
          />

          <MultiSelectField
            label="Categories"
            name="categoryIds"
            options={categoryOptions}
            value={categoryIds}
            onChange={setCategoryIds}
            emptyMessage="No categories yet."
            placeholder="Select categories..."
          />

          <MultiSelectField
            label="Tags"
            name="tagIds"
            options={tagOptions}
            value={tagIds}
            onChange={setTagIds}
            emptyMessage="No tags yet."
            placeholder="Select tags..."
          />



          <CheckboxField
            label="Enable reviews"
            name="enableReviews"
            checked={enableReviews}
            onCheckedChange={setEnableReviews}
          />

          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-medium">SEO</h3>
            <TextField
              label="Meta title"
              name="metaTitle"
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
              placeholder="Leave blank to use product title"
            />
            <TextareaField
              label="Meta description"
              name="metaDescription"
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              rows={3}
            />
            <TextField
              label="Canonical URL"
              name="canonicalUrl"
              value={canonicalUrl}
              onChange={(event) => setCanonicalUrl(event.target.value)}
              placeholder="https://example.com/products/item"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
