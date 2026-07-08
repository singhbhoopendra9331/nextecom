"use server";

import { revalidatePath } from "next/cache";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { saveGlobalFooterSettings } from "@/lib/settings";
import type { GlobalFooterSettings } from "@/types/settings";

export async function updateGlobalFooterSettings(data: GlobalFooterSettings) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    await saveGlobalFooterSettings({
      showQuickLinks: data.showQuickLinks,
      showContact: data.showContact,
      copyrightText: data.copyrightText.trim(),
      taglineOverride: data.taglineOverride.trim(),
      socialLinks: data.socialLinks.map((link) => ({
        ...link,
        label: link.label.trim(),
        url: link.url.trim(),
      })),
      linkColumns: data.linkColumns.map((column) => ({
        ...column,
        title: column.title.trim(),
        links: column.links.map((link) => ({
          ...link,
          title: link.title.trim(),
          href: link.href.trim(),
        })),
      })),
    });

    revalidatePath("/admin/globals");
    revalidatePath("/admin/globals/global-footer");
    revalidatePath("/", "layout");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateGlobalFooterSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save footer settings",
    };
  }
}
