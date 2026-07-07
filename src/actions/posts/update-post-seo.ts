"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { syncSeoMeta, type SeoInput } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePostSeo(id: string, seo: SeoInput) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Post id is required");
    }

    const post = await prisma.$transaction(async (tx) => {
      const existing = await tx.post.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });

      if (!existing) {
        throw new Error("Post not found");
      }

      await syncSeoMeta(tx, seo, { postId: id });

      return existing;
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);
    revalidatePath(`/posts/${post.slug}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("updatePostSeo", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update SEO",
    };
  }
}
