"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import {
  buildProductData,
  buildSlug,
  type ProductInput,
} from "@/lib/products/product-utils";

export type { ProductInput } from "@/lib/products/product-utils";

export async function createProduct(data: ProductInput) {
  const auth = await authorize("products:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }

    const slug = buildSlug(data.title, data.slug);

    const product = await prisma.product.create({
      data: buildProductData(data, slug),
      include: {
        featuredImage: true,
        brand: true,
        categories: true,
        tags: true,
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      data: product,
    };
  } catch (error: unknown) {
    console.error("createProduct", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}
