"use server";
import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Input = {
  title: string;
  content?: unknown;
  status?: PostStatus | undefined;
  featuredImageId?: string | null;
};

export async function updatePage(id: string, data: Input) {
  try {
    if (!id) {
      throw new Error("Page id is required");
    }

    if (!data.title) {
      throw new Error("Title is required");
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content ?? [],
        featuredImageId: data.featuredImageId ?? null,
        status: data.status ?? PostStatus.DRAFT,
      },
    });

    return {
      success: true,
      data: page,
    };
  } catch (error: unknown) {
    console.error("updatePage", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
    };
  }
}