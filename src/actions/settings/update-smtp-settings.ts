"use server";

import { revalidatePath } from "next/cache";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { saveSmtpSettings, type SmtpSettings } from "@/lib/settings";

export async function updateSmtpSettings(data: SmtpSettings) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (data.enabled) {
      if (!data.host?.trim()) {
        throw new Error("SMTP host is required when SMTP is enabled");
      }

      if (!data.fromEmail?.trim()) {
        throw new Error("From email is required when SMTP is enabled");
      }

      const port = Number(data.port);

      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP port must be between 1 and 65535");
      }
    }

    await saveSmtpSettings({
      enabled: data.enabled,
      host: data.host.trim(),
      port: Number(data.port) || 587,
      username: data.username.trim(),
      password: data.password,
      fromEmail: data.fromEmail.trim(),
      fromName: data.fromName.trim(),
      encryption: data.encryption,
    });

    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateSmtpSettings", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to save SMTP settings",
    };
  }
}
