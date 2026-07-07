"use server";
import { PostStatus } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { syncSeoMeta, type SeoInput } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";

type Input = {
  title: string;
  content?: unknown;
  status?: PostStatus | undefined;
  featuredImageId?: string | null;
  seo?: SeoInput;
};

export async function updatePage(id: string, data: Input) {
  const auth = await authorize("pages:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Page id is required");
    }

    if (!data.title) {
      throw new Error("Title is required");
    }

    const page = await prisma.$transaction(async (tx) => {
      const updated = await tx.page.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content ?? [],
          featuredImageId: data.featuredImageId ?? null,
          status: data.status ?? PostStatus.DRAFT,
        },
      });

      await syncSeoMeta(tx, data.seo, { pageId: id });

      return updated;
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