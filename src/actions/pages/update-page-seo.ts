"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { syncSeoMeta, type SeoInput } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePageSeo(id: string, seo: SeoInput) {
  const auth = await authorize("pages:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Page id is required");
    }

    const page = await prisma.$transaction(async (tx) => {
      const existing = await tx.page.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });

      if (!existing) {
        throw new Error("Page not found");
      }

      await syncSeoMeta(tx, seo, { pageId: id });

      return existing;
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${id}/edit`);
    revalidatePath(`/${page.slug}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("updatePageSeo", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update SEO",
    };
  }
}
