import type {
  FormEmailSettings,
  FormFieldDefinition,
  FormSubmitSettings,
} from "@/types/forms";

export const DEFAULT_FORM_EMAIL_SETTINGS: FormEmailSettings = {
  enabled: false,
  to: "",
  subject: "New submission for {{formTitle}}",
  body: "You received a new form submission.\n\n{{name}}\n{{email}}\n{{message}}",
};

export const DEFAULT_FORM_SUBMIT_SETTINGS: FormSubmitSettings = {
  mode: "message",
  successMessage: "Thank you. Your submission has been received.",
};

export function createEmptyField(): FormFieldDefinition {
  return {
    id: crypto.randomUUID(),
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
  };
}
