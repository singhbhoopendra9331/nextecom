import { sendMail } from "@/lib/email/send-mail";
import {
  buildFormEmailPlaceholders,
  renderFormPlaceholders,
} from "@/lib/forms/render-placeholders";
import { logger } from "@/lib/logger";
import { getGlobalSettings, getSmtpSettings } from "@/lib/settings";
import type { FormEmailSettings, FormSubmissionData } from "@/types/forms";

export async function sendFormNotificationEmail(input: {
  formTitle: string;
  emailSettings: FormEmailSettings;
  submissionData: FormSubmissionData;
  submittedAt: Date;
}) {
  if (!input.emailSettings.enabled || !input.emailSettings.to.trim()) {
    return;
  }

  const [globalSettings, smtpSettings] = await Promise.all([
    getGlobalSettings(),
    getSmtpSettings(),
  ]);

  const placeholders = buildFormEmailPlaceholders({
    formTitle: input.formTitle,
    submittedAt: input.submittedAt,
    submissionData: input.submissionData,
    siteTitle: globalSettings.siteTitle,
    contactEmail: globalSettings.contactEmail,
  });

  const subject = renderFormPlaceholders(input.emailSettings.subject, placeholders);
  const body = renderFormPlaceholders(input.emailSettings.body, placeholders);

  const fromEmail = input.emailSettings.fromEmail?.trim() || smtpSettings.fromEmail;
  const fromName = input.emailSettings.fromName?.trim() || smtpSettings.fromName;
  const from =
    fromEmail && fromName ? `${fromName} <${fromEmail}>` : fromEmail || undefined;

  const replyToField = input.emailSettings.replyToField?.trim();
  const replyToValue =
    replyToField && input.submissionData[replyToField] != null
      ? String(input.submissionData[replyToField])
      : undefined;

  const result = await sendMail({
    to: input.emailSettings.to,
    subject,
    text: body,
    html: body.includes("<") ? body : undefined,
    from,
    replyTo: replyToValue,
  });

  if (!result.sent) {
    logger.warn("[forms] Notification email not sent", {
      formTitle: input.formTitle,
      reason: result.reason,
      error: "error" in result ? result.error : undefined,
    });
  }
}
