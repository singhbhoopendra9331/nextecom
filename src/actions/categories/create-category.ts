"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Input = {
  name: string;
};

export async function createCategory(data: Input) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const name = data.name?.trim();

    if (!name) {
      throw new Error("Name is required");
    }

    const category = await prisma.category.create({
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
    console.error("createCategory", error);

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
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}
