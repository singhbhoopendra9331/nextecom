"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

type Input = {
  title: string;
  content?: unknown;
  authorId: string;
  featuredImageId?: string | null;
  tags?: string[];
  categories?: string[];
};

export async function updatePost(id: string, data: Input) {
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

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: Array.isArray(data.content) ? data.content : [],
        authorId: data.authorId,
        featuredImageId: data.featuredImageId ?? null,
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

    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);

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
