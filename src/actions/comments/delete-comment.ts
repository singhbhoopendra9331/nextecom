"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComment(id: string) {
  const auth = await authorize("comments:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const comment = await prisma.comment.delete({
      where: { id },
      select: {
        post: {
          select: { slug: true },
        },
      },
    });

    revalidatePath("/admin/comments");
    revalidatePath(`/posts/${comment.post.slug}`);

    return {
      success: true as const,
    };
  } catch (error: unknown) {
    console.error("deleteComment", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}
