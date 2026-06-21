"use server";

import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

type Input = {
  title: string;
  content?: unknown;
  status?: PostStatus | undefined;
  featuredImageId?: string | null;
};

export async function createPage(data: Input) {
  try {
    if (!data.title) {
      throw new Error("Title is required");
    }

    const slug = slugify(data.title, {
      lower: true,
      strict: true,
    });

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug,
        content: data.content ?? [],
        featuredImageId: data.featuredImageId,
        status: data.status ?? PostStatus.DRAFT,
      },
    });

    return {
      success: true,
      data: page,
    };

  } catch (error: unknown) {
    console.error("createPage", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
    };
  }
}
