"use server";

import { PostStatus } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { syncSeoMeta, type SeoInput } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { sanitizeBlockContent } from "@/lib/sanitize-json-for-prisma";
import slugify from "slugify";

type Input = {
  title: string;
  content?: unknown;
  status?: PostStatus | undefined;
  featuredImageId?: string | null;
  seo?: SeoInput;
};

export async function createPage(data: Input) {
  const auth = await authorize("pages:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!data.title) {
      throw new Error("Title is required");
    }

    const slug = slugify(data.title, {
      lower: true,
      strict: true,
    });

    const page = await prisma.$transaction(async (tx) => {
      const created = await tx.page.create({
        data: {
          title: data.title,
          slug,
          content: sanitizeBlockContent(data.content),
          featuredImageId: data.featuredImageId,
          status: data.status ?? PostStatus.DRAFT,
        },
      });

      await syncSeoMeta(tx, data.seo, { pageId: created.id });

      return created;
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
