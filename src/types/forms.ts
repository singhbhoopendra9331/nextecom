export const FORM_FIELD_TYPES = [
  "text",
  "email",
  "textarea",
  "select",
  "checkbox",
  "number",
  "tel",
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldDefinition = {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
};

export type FormEmailSettings = {
  enabled: boolean;
  to: string;
  fromEmail?: string;
  fromName?: string;
  subject: string;
  body: string;
  replyToField?: string;
};

export type FormSubmitSettings = {
  mode: "redirect" | "message";
  redirectUrl?: string;
  successMessage?: string;
};

export type FormSubmissionData = Record<string, string | boolean | number>;

export type SubmitFormResult =
  | {
      success: true;
      mode: "redirect" | "message";
      redirectUrl?: string;
      successMessage?: string;
    }
  | {
      success: false;
      error: string;
    };
