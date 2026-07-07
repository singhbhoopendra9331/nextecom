import { z } from "zod";

import {
  FORM_FIELD_TYPES,
  type FormFieldDefinition,
  type FormSubmissionData,
} from "@/types/forms";

export const formFieldOptionSchema = z.object({
  label: z.string().trim().min(1, "Option label is required"),
  value: z.string().trim().min(1, "Option value is required"),
});

export const formFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Field name is required")
    .regex(/^[a-z0-9_]+$/, "Field name must be lowercase letters, numbers, or underscores"),
  label: z.string().trim().min(1, "Field label is required"),
  type: z.enum(FORM_FIELD_TYPES),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(formFieldOptionSchema).optional(),
});

export const formEmailSettingsSchema = z
  .object({
    enabled: z.boolean(),
    to: z.string().trim(),
    fromEmail: z.string().trim().optional(),
    fromName: z.string().trim().optional(),
    subject: z.string().trim(),
    body: z.string(),
    replyToField: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) {
      return;
    }

    if (!value.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recipient email is required when notifications are enabled",
        path: ["to"],
      });
    }

    if (!value.subject.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email subject is required when notifications are enabled",
        path: ["subject"],
      });
    }

    if (!value.body.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email body is required when notifications are enabled",
        path: ["body"],
      });
    }
  });

export const formSubmitSettingsSchema = z
  .object({
    mode: z.enum(["redirect", "message"]),
    redirectUrl: z.string().trim().optional(),
    successMessage: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "redirect" && !value.redirectUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Redirect URL is required when submit mode is redirect",
        path: ["redirectUrl"],
      });
    }

    if (value.mode === "message" && !value.successMessage?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Success message is required when submit mode is message",
        path: ["successMessage"],
      });
    }
  });

export const createFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  fields: z.array(formFieldDefinitionSchema).min(1, "At least one field is required"),
  email: formEmailSettingsSchema.nullable().optional(),
  submit: formSubmitSettingsSchema,
});

export const updateFormSchema = createFormSchema;

export function parseFormFields(value: unknown): FormFieldDefinition[] {
  return z.array(formFieldDefinitionSchema).parse(value);
}

export function buildSubmissionSchema(fields: FormFieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "checkbox":
        fieldSchema = z.boolean();
        break;
      case "number":
        fieldSchema = z.coerce.number();
        break;
      case "email":
        fieldSchema = z.string().trim().email("Invalid email address");
        break;
      case "select":
        fieldSchema = z.string().trim();
        if (field.options?.length) {
          fieldSchema = z.enum(
            field.options.map((option) => option.value) as [string, ...string[]]
          );
        }
        break;
      default:
        fieldSchema = z.string().trim();
        break;
    }

    if (!field.required) {
      if (field.type === "checkbox") {
        fieldSchema = fieldSchema.optional();
      } else {
        fieldSchema = z.union([fieldSchema, z.literal("")]).optional();
      }
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}

export function parseSubmissionData(
  fields: FormFieldDefinition[],
  data: unknown
): FormSubmissionData {
  const schema = buildSubmissionSchema(fields);
  const parsed = schema.parse(data);
  const result: FormSubmissionData = {};

  for (const field of fields) {
    const value = parsed[field.name as keyof typeof parsed];

    if (value === undefined || value === "") {
      if (field.type === "checkbox") {
        result[field.name] = false;
      }
      continue;
    }

    result[field.name] = value as string | boolean | number;
  }

  return result;
}
