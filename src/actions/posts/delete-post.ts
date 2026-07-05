"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePost(id: string) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

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
