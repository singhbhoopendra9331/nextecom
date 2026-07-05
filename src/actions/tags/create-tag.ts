"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Input = {
  name: string;
};

export async function createTag(data: Input) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const name = data.name?.trim();

    if (!name) {
      throw new Error("Name is required");
    }

    const tag = await prisma.tag.create({
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    revalidatePath("/admin/tags");

    return {
      success: true as const,
      data: tag,
    };
  } catch (error: unknown) {
    console.error("createTag", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "A tag with this name already exists",
      };
    }

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create tag",
    };
  }
}
