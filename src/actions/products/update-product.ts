"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import {
  buildProductData,
  buildSlug,
  type ProductInput,
} from "@/lib/products/product-utils";

export async function updateProduct(id: string, data: ProductInput) {
  const auth = await authorize("products:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Product id is required");
    }

    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }

    const slug = buildSlug(data.title, data.slug);
    const productData = buildProductData(data, slug);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        categories: data.categoryIds
          ? { set: data.categoryIds.map((categoryId) => ({ id: categoryId })) }
          : undefined,
        tags: data.tagIds
          ? { set: data.tagIds.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
      include: {
        featuredImage: true,
        brand: true,
        categories: true,
        tags: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return {
      success: true,
      data: product,
    };
  } catch (error: unknown) {
    console.error("updateProduct", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}
