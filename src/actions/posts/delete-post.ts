"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePost(id: string) {
  try {
    if (!id) {
      throw new Error("Post id is required");
    }

    await prisma.$transaction([
      prisma.meta.deleteMany({ where: { postId: id } }),
      prisma.post.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/posts");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("deletePost", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}
