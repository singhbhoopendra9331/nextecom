"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  const auth = await authorize("products:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Product id is required");
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("deleteProduct", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}
