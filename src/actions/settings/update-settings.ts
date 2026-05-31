"use server";

import { revalidatePath } from "next/cache";

import {
  getGlobalSettings,
  saveGlobalSettings,
  type GlobalSettings,
} from "@/lib/settings";

export async function getSettingsAction() {
  return getGlobalSettings();
}

export async function updateGlobalSettings(data: GlobalSettings) {
  try {
    if (!data.siteTitle?.trim()) {
      throw new Error("Site title is required");
    }

    await saveGlobalSettings({
      siteTitle: data.siteTitle.trim(),
      siteTagline: data.siteTagline.trim(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone.trim(),
      address: data.address.trim(),
      currency: data.currency.trim() || "USD",
      timezone: data.timezone.trim() || "UTC",
    });

    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateGlobalSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save settings",
    };
  }
}
