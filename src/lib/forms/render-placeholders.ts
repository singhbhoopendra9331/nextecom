import { renderPlaceholderString } from "@/lib/email/render-template";

export type FormPlaceholders = Record<string, string | number | undefined | null>;

export function renderFormPlaceholders(template: string, placeholders: FormPlaceholders) {
  return renderPlaceholderString(template, placeholders);
}

export function buildFormEmailPlaceholders(input: {
  formTitle: string;
  submittedAt: Date;
  submissionData: Record<string, string | boolean | number>;
  siteTitle?: string;
  contactEmail?: string;
}) {
  const fieldPlaceholders: FormPlaceholders = {};

  for (const [key, value] of Object.entries(input.submissionData)) {
    fieldPlaceholders[key] = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  }

  return {
    ...fieldPlaceholders,
    formTitle: input.formTitle,
    siteTitle: input.siteTitle ?? "",
    contactEmail: input.contactEmail ?? "",
    submittedAt: input.submittedAt.toISOString(),
  };
}
