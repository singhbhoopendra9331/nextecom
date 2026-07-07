import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CmsFormEditor from "@/components/admin/cms-form-editor";
import { createAdminMetadata } from "@/lib/admin/metadata";
import {
  parseStoredFormEmail,
  parseStoredFormFields,
  parseStoredFormSubmit,
} from "@/lib/forms/parse-form-json";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await prisma.form.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!form) {
    return createAdminMetadata("Edit Form", "Edit a form.");
  }

  return createAdminMetadata(`Edit Form: ${form.title}`, `Edit "${form.title}".`);
}

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  return (
    <CmsFormEditor
      mode="edit"
      formId={form.id}
      initialValues={{
        title: form.title,
        slug: form.slug,
        status: form.status,
        fields: parseStoredFormFields(form.fields),
        email: parseStoredFormEmail(form.email),
        submit: parseStoredFormSubmit(form.submit),
      }}
    />
  );
}
