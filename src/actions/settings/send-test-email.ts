"use server";

import { z } from "zod";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { sendMail } from "@/lib/email/send-mail";
import { logger } from "@/lib/logger";
import { SmtpSettings } from "@/types/settings";

const testEmailSchema = z.object({
  to: z.email("Enter a valid recipient email address"),
});

function normalizeSmtpSettings(smtp: SmtpSettings): SmtpSettings {
  return {
    ...smtp,
    host: smtp.host.trim(),
    port: Number(smtp.port) || 587,
    username: smtp.username.trim(),
    fromEmail: smtp.fromEmail.trim(),
    fromName: smtp.fromName.trim(),
  };
}

function getSendFailureMessage(
  reason: "smtp_disabled" | "smtp_misconfigured" | "send_failed",
  error?: string
) {
  switch (reason) {
    case "smtp_disabled":
      return "Enable SMTP before sending a test email";
    case "smtp_misconfigured":
      return "Host and from email are required";
    case "send_failed":
      return error ?? "Failed to send test email";
  }
}

export async function sendTestEmail(input: { to: string; smtp: SmtpSettings }) {
  const auth = await authorize("settings:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  const parsed = testEmailSchema.safeParse({ to: input.to.trim() });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  const smtp = normalizeSmtpSettings(input.smtp);

  if (!smtp.enabled) {
    return {
      success: false as const,
      error: "Enable SMTP before sending a test email",
    };
  }

  if (!smtp.host || !smtp.fromEmail) {
    return {
      success: false as const,
      error: "Host and from email are required",
    };
  }

  const port = Number(smtp.port);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return {
      success: false as const,
      error: "SMTP port must be between 1 and 65535",
    };
  }

  try {
    const result = await sendMail({
      to: parsed.data.to,
      subject: "NextEcom SMTP test email",
      text: "This is a test email from your NextEcom admin panel. SMTP is configured correctly.",
      html: "<p>This is a test email from your NextEcom admin panel.</p><p>SMTP is configured correctly.</p>",
      smtp,
    });

    if (!result.sent) {
      return {
        success: false as const,
        error: getSendFailureMessage(result.reason, result.error),
      };
    }

    return { success: true as const };
  } catch (error) {
    logger.error("sendTestEmail", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to send test email",
    };
  }
}
