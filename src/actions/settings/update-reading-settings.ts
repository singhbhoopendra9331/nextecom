"use server";

import { revalidatePath } from "next/cache";

import { PostStatus } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { saveReadingSettings } from "@/lib/settings";
import type { ReadingSettings } from "@/types/settings";

export async function updateReadingSettings(data: ReadingSettings) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const homepagePageId = data.homepagePageId || null;

    if (homepagePageId) {
      const page = await prisma.page.findFirst({
        where: {
          id: homepagePageId,
          status: PostStatus.PUBLISHED,
        },
        select: { id: true },
      });

      if (!page) {
        throw new Error("Selected homepage page must be published");
      }
    }

    await saveReadingSettings({ homepagePageId });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateReadingSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save reading settings",
    };
  }
}
