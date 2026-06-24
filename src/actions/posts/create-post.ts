"use server";

import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

type Input = {
  title: string;
  content?: any;
  authorId: string;
  featuredImageId?: string | null;
  status?: PostStatus;
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
        status: data.status ?? PostStatus.DRAFT,

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
    revalidatePath("/blogs");

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