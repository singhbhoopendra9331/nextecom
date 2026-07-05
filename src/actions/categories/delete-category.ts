"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteCategory(id: string) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Category id is required");
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");

    return {
      success: true as const,
    };
  } catch (error: unknown) {
    console.error("deleteCategory", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
