import type {
  FormEmailSettings,
  FormFieldDefinition,
  FormSubmitSettings,
} from "@/types/forms";

import {
  formEmailSettingsSchema,
  formFieldDefinitionSchema,
  formSubmitSettingsSchema,
} from "./schemas";
import {
  DEFAULT_FORM_EMAIL_SETTINGS,
  DEFAULT_FORM_SUBMIT_SETTINGS,
} from "./defaults";

export function parseStoredFormFields(value: unknown): FormFieldDefinition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const parsed = formFieldDefinitionSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseStoredFormEmail(value: unknown): FormEmailSettings | null {
  if (value == null) {
    return null;
  }

  const parsed = formEmailSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_FORM_EMAIL_SETTINGS;
}

export function parseStoredFormSubmit(value: unknown): FormSubmitSettings {
  const parsed = formSubmitSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_FORM_SUBMIT_SETTINGS;
}
