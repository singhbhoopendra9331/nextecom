import { readFile } from "node:fs/promises";
import path from "node:path";

const TEMPLATES_DIR = path.join(process.cwd(), "src/templates/emails");

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailPlaceholders = Record<string, string | number | undefined | null>;

export function renderPlaceholderString(
  template: string,
  placeholders: EmailPlaceholders,
  options?: { escapeHtml?: boolean }
) {
  const shouldEscape = options?.escapeHtml ?? false;

  return template.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    const value = placeholders[key];

    if (value == null) {
      return "";
    }

    const rendered = String(value);
    return shouldEscape ? escapeHtml(rendered) : rendered;
  });
}

async function readTemplateFile(filename: string) {
  return readFile(path.join(TEMPLATES_DIR, filename), "utf-8");
}

export async function renderEmailTemplate(input: {
  subject: string;
  htmlFile: string;
  textFile: string;
  placeholders: EmailPlaceholders;
}) {
  const [htmlTemplate, textTemplate] = await Promise.all([
    readTemplateFile(input.htmlFile),
    readTemplateFile(input.textFile),
  ]);

  return {
    subject: renderPlaceholderString(input.subject, input.placeholders),
    html: renderPlaceholderString(htmlTemplate, input.placeholders, {
      escapeHtml: true,
    }),
    text: renderPlaceholderString(textTemplate, input.placeholders),
  };
}
