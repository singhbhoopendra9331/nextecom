"use server";

import { CommentStatus } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const COMMENT_STATUSES = new Set<string>(Object.values(CommentStatus));

type Input = {
  id: string;
  status: CommentStatus;
};

export async function updateCommentStatus(input: Input) {
  const auth = await authorize("comments:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  if (!COMMENT_STATUSES.has(input.status)) {
    return {
      success: false as const,
      error: "Invalid status",
    };
  }

  try {
    const comment = await prisma.comment.update({
      where: { id: input.id },
      data: { status: input.status },
      select: {
        id: true,
        status: true,
        post: {
          select: { slug: true },
        },
      },
    });

    revalidatePath("/admin/comments");
    revalidatePath(`/posts/${comment.post.slug}`);

    return {
      success: true as const,
      data: comment,
    };
  } catch (error: unknown) {
    console.error("updateCommentStatus", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update comment status",
    };
  }
}
