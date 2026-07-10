"use server";

import { PostStatus } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { syncRelatedPostsMeta } from "@/lib/meta/related-posts";
import { syncSeoMeta, type SeoInput } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

type Input = {
  title: string;
  content?: unknown;
  authorId: string;
  featuredImageId?: string | null;
  status?: PostStatus;
  tags?: string[];
  categories?: string[];
  relatedPostIds?: string[];
  seo?: SeoInput;
};

export async function updatePost(id: string, data: Input) {
  const auth = await authorize("posts:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Post id is required");
    }

    if (!data.title) {
      throw new Error("Title is required");
    }

    if (!data.authorId) {
      throw new Error("Author is required");
    }

    const slug = slugify(data.title, {
      lower: true,
      strict: true,
    });

    const post = await prisma.$transaction(async (tx) => {
      const updated = await tx.post.update({
        where: { id },
        data: {
          title: data.title,
          slug,
          content: Array.isArray(data.content) ? data.content : [],
          authorId: data.authorId,
          featuredImageId: data.featuredImageId ?? null,
          status: data.status ?? PostStatus.DRAFT,
          tags: data.tags
            ? {
                set: data.tags.map((tagId) => ({ id: tagId })),
              }
            : undefined,
          categories: data.categories
            ? {
                set: data.categories.map((categoryId) => ({ id: categoryId })),
              }
            : undefined,
        },
        include: {
          featuredImage: true,
          author: true,
        },
      });

      await syncSeoMeta(tx, data.seo, { postId: id });
      await syncRelatedPostsMeta(tx, data.relatedPostIds, {
        postId: id,
        excludePostId: id,
      });

      return updated;
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);
    revalidatePath("/blogs");
    revalidatePath(`/posts/${slug}`);

    return {
      success: true,
      data: post,
    };
  } catch (error: unknown) {
    console.error("updatePost", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}
