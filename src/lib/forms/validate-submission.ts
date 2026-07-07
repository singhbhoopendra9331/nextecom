import type { FormFieldDefinition, FormSubmissionData } from "@/types/forms";

import { parseSubmissionData } from "./schemas";

export function validateSubmission(
  fields: FormFieldDefinition[],
  data: unknown
):
  | { success: true; data: FormSubmissionData }
  | { success: false; error: string } {
  try {
    const parsed = parseSubmissionData(fields, data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Invalid submission data" };
  }
}
