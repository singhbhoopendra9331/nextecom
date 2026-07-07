"use server";

import { FormStatus, Prisma } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import {
  DEFAULT_FORM_EMAIL_SETTINGS,
  DEFAULT_FORM_SUBMIT_SETTINGS,
} from "@/lib/forms/defaults";
import { createFormSchema } from "@/lib/forms/schemas";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

type Input = {
  title: string;
  slug?: string;
  status?: FormStatus;
  fields: unknown;
  email?: unknown;
  submit: unknown;
};

export async function createForm(data: Input) {
  const auth = await authorize("forms:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    const parsed = createFormSchema.parse({
      ...data,
      fields: data.fields,
      email: data.email ?? DEFAULT_FORM_EMAIL_SETTINGS,
      submit: data.submit ?? DEFAULT_FORM_SUBMIT_SETTINGS,
    });

    const slug =
      parsed.slug?.trim() ||
      slugify(parsed.title, {
        lower: true,
        strict: true,
      });

    const form = await prisma.form.create({
      data: {
        title: parsed.title,
        slug,
        status: parsed.status ?? FormStatus.ACTIVE,
        fields: parsed.fields as Prisma.InputJsonValue,
        email: (parsed.email ?? null) as Prisma.InputJsonValue,
        submit: parsed.submit as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/forms");

    return {
      success: true as const,
      data: form,
    };
  } catch (error: unknown) {
    console.error("createForm", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "A form with this slug already exists",
      };
    }

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create form",
    };
  }
}
