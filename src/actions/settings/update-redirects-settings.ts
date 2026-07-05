"use server";

import { revalidatePath } from "next/cache";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { sanitizeRedirectsSettings } from "@/lib/redirects";
import { saveRedirectsSettings } from "@/lib/settings";
import type { RedirectsSettings } from "@/types/settings";

export async function updateRedirectsSettings(data: RedirectsSettings) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const sanitized = sanitizeRedirectsSettings(data);

    await saveRedirectsSettings(sanitized);
    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateRedirectsSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save redirects",
    };
  }
}
