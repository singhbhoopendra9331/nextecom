import nodemailer from "nodemailer";

import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getSmtpSettings } from "@/lib/settings";
import { SendMailInput } from "@/types/email";

type SendMailResult =
  | { sent: true }
  | { sent: false; reason: "smtp_disabled" | "smtp_misconfigured" | "send_failed"; error?: string };

export async function sendMail({
  to,
  subject,
  text,
  html,
  from,
  replyTo,
  smtp: smtpOverride,
}: SendMailInput): Promise<SendMailResult> {
  const smtp = smtpOverride ?? (await getSmtpSettings());

  if (!smtp.enabled) {
    logger.warn("[email] SMTP disabled; message not sent:", { to, subject, text });
    return { sent: false, reason: "smtp_disabled" };
  }

  const fromEmail = from ?? smtp.fromEmail;

  if (!smtp.host || !fromEmail) {
    logger.warn("[email] SMTP misconfigured; message not sent:", {
      to,
      subject,
    });
    return { sent: false, reason: "smtp_misconfigured" };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.encryption === "ssl",
    auth:
      smtp.username && smtp.password
        ? {
            user: smtp.username,
            pass: smtp.password,
          }
        : undefined,
    ...(smtp.encryption === "tls" ? { requireTLS: true } : {}),
  });

  try {
    await transporter.sendMail({
      from: smtp.fromName && !from
        ? `${smtp.fromName} <${fromEmail}>`
        : fromEmail,
      to,
      replyTo,
      subject,
      text,
      html,
    });

    logger.info("[email] Message sent:", { to, subject });
    return { sent: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email";

    logger.error("[email] Failed to send message:", error, { to, subject });
    return { sent: false, reason: "send_failed", error: message };
  }
}

export function getAppBaseUrl() {
  return getEnv("NEXT_PUBLIC_SERVER_URL", "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
