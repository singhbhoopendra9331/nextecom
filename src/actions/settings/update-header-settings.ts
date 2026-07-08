"use server";

import { revalidatePath } from "next/cache";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import {
  normalizeGlobalNavChildLink,
  normalizeGlobalNavLink,
} from "@/lib/navigation/nav-link-utils";
import { saveGlobalHeaderSettings } from "@/lib/settings";
import type { GlobalHeaderSettings } from "@/types/settings";

function isValidCustomNavLink(link: GlobalHeaderSettings["customNavLinks"][number]) {
  if (!link.enabled || !link.title.trim()) {
    return false;
  }

  if (link.type === "dropdown") {
    return link.children.some(
      (child) => child.enabled && child.title.trim() && child.href.trim()
    );
  }

  return Boolean(link.href.trim());
}

export async function updateGlobalHeaderSettings(data: GlobalHeaderSettings) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (data.navMode === "custom") {
      const hasValidLink = data.customNavLinks.some(isValidCustomNavLink);

      if (!hasValidLink) {
        throw new Error("Add at least one enabled navigation link or dropdown");
      }
    }

    if (data.cta.enabled) {
      if (!data.cta.label.trim() || !data.cta.href.trim()) {
        throw new Error("CTA label and URL are required when enabled");
      }
    }

    await saveGlobalHeaderSettings({
      showSiteTitle: data.showSiteTitle,
      logoMediaId: data.logoMediaId || null,
      navMode: data.navMode,
      includePrimaryNav: data.includePrimaryNav,
      includeCmsPages: data.includeCmsPages,
      customNavLinks: data.customNavLinks.map((link) => {
        const normalized = normalizeGlobalNavLink(link);

        return {
          ...normalized,
          title: normalized.title.trim(),
          href: normalized.href.trim(),
          children: normalized.children.map((child) => {
            const normalizedChild = normalizeGlobalNavChildLink(child);
            return {
              ...normalizedChild,
              title: normalizedChild.title.trim(),
              href: normalizedChild.href.trim(),
            };
          }),
        };
      }),
      cta: {
        enabled: data.cta.enabled,
        label: data.cta.label.trim(),
        href: data.cta.href.trim(),
      },
    });

    revalidatePath("/admin/globals");
    revalidatePath("/admin/globals/global-header");
    revalidatePath("/", "layout");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateGlobalHeaderSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save header settings",
    };
  }
}
