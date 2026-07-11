"use server";

import { FormStatus, Prisma } from "@/generated/prisma/client";
import {
  parseStoredFormEmail,
  parseStoredFormFields,
  parseStoredFormSubmit,
} from "@/lib/forms/parse-form-json";
import { getSubmissionRequestMeta } from "@/lib/forms/request-meta";
import { sendFormNotificationEmail } from "@/lib/forms/send-notification-email";
import { validateSubmission } from "@/lib/forms/validate-submission";
import { prisma } from "@/lib/prisma";
import {
  enforceRateLimit,
  rateLimitActionError,
} from "@/lib/rate-limit";
import type { SubmitFormResult } from "@/types/forms";

type Input = {
  slug: string;
  data: unknown;
  source?: string | null;
};

export async function submitForm(input: Input): Promise<SubmitFormResult> {
  try {
    const rateLimited = await enforceRateLimit("submit");
    if (rateLimited) {
      return rateLimitActionError(rateLimited);
    }

    const form = await prisma.form.findFirst({
      where: {
        slug: input.slug,
        status: FormStatus.ACTIVE,
      },
    });

    if (!form) {
      return {
        success: false,
        error: "Form not found",
      };
    }

    const fields = parseStoredFormFields(form.fields);
    const validation = validateSubmission(fields, input.data);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const requestMeta = await getSubmissionRequestMeta(input.source);
    const submittedAt = new Date();

    await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: validation.data as Prisma.InputJsonValue,
        ip: requestMeta.ip,
        source: requestMeta.source,
        userAgent: requestMeta.userAgent,
      },
    });

    const emailSettings = parseStoredFormEmail(form.email);
    if (emailSettings) {
      await sendFormNotificationEmail({
        formTitle: form.title,
        emailSettings,
        submissionData: validation.data,
        submittedAt,
      });
    }

    const submitSettings = parseStoredFormSubmit(form.submit);

    return {
      success: true,
      mode: submitSettings.mode,
      redirectUrl: submitSettings.redirectUrl,
      successMessage: submitSettings.successMessage,
    };
  } catch (error: unknown) {
    console.error("submitForm", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit form",
    };
  }
}
