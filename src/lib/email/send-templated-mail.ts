import { getGlobalSettings } from "@/lib/settings";
import type { SmtpSettings } from "@/types/settings";

import { renderEmailTemplate, type EmailPlaceholders } from "./render-template";
import { EMAIL_TEMPLATES, type EmailTemplateName } from "./templates";
import { sendMail } from "./send-mail";

type SendTemplatedMailInput = {
  to: string;
  template: EmailTemplateName;
  placeholders?: EmailPlaceholders;
  smtp?: SmtpSettings;
};

export async function sendTemplatedMail({
  to,
  template,
  placeholders = {},
  smtp,
}: SendTemplatedMailInput) {
  const [globalSettings, templateConfig] = await Promise.all([
    getGlobalSettings(),
    Promise.resolve(EMAIL_TEMPLATES[template]),
  ]);

  const mergedPlaceholders: EmailPlaceholders = {
    siteTitle: globalSettings.siteTitle,
    siteTagline: globalSettings.siteTagline,
    contactEmail: globalSettings.contactEmail,
    ...placeholders,
  };

  const rendered = await renderEmailTemplate({
    subject: templateConfig.subject,
    htmlFile: templateConfig.html,
    textFile: templateConfig.text,
    placeholders: mergedPlaceholders,
  });

  return sendMail({
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    smtp,
  });
}
