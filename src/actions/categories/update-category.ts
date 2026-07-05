"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Input = {
  name: string;
};

export async function updateCategory(id: string, data: Input) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Category id is required");
    }

    const name = data.name?.trim();

    if (!name) {
      throw new Error("Name is required");
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true as const,
      data: category,
    };
  } catch (error: unknown) {
    console.error("updateCategory", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "A category with this name already exists",
      };
    }

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}
