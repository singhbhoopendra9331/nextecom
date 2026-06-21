"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

type Input = {
  title: string;
  content?: any;
  authorId: string;
  featuredImageId?: string | null;
  tags?: string[];
  categories?: string[];
};

export async function createPost(data: Input) {
  try {
    if (!data.title) {
      throw new Error("Title is required");
    }

    const slug = slugify(data.title, {
      lower: true,
      strict: true,
    });

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: Array.isArray(data.content) ? data.content : [],
        authorId: data.authorId,

        featuredImageId: data.featuredImageId ?? null,

        tags: data.tags
          ? {
              connect: data.tags.map((id) => ({ id })),
            }
          : undefined,

        categories: data.categories
          ? {
              connect: data.categories.map((id) => ({ id })),
            }
          : undefined,
      },

      include: {
        featuredImage: true,
        author: true,
      },
    });

    revalidatePath("/admin/posts");

    return {
      success: true,
      data: post,
    };
  } catch (error: any) {
    console.error("createPost", error);

    return {
      success: false,
      error: error.message || "Failed to create post",
    };
  }
}