import nodemailer from "nodemailer";

import { getEnv } from "@/lib/env";
import { getSmtpSettings } from "@/lib/settings";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail({ to, subject, text, html }: SendMailInput) {
  const smtp = await getSmtpSettings();

  if (!smtp.enabled) {
    console.warn("[email] SMTP disabled; message not sent:", { to, subject, text });
    return { sent: false as const, reason: "smtp_disabled" as const };
  }

  if (!smtp.host || !smtp.fromEmail) {
    console.warn("[email] SMTP misconfigured; message not sent:", {
      to,
      subject,
    });
    return { sent: false as const, reason: "smtp_misconfigured" as const };
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

  await transporter.sendMail({
    from: smtp.fromName
      ? `${smtp.fromName} <${smtp.fromEmail}>`
      : smtp.fromEmail,
    to,
    subject,
    text,
    html,
  });

  return { sent: true as const };
}

export function getAppBaseUrl() {
  return getEnv("NEXT_PUBLIC_SERVER_URL", "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
