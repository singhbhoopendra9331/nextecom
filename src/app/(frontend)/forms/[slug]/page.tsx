import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PublicFormRenderer from "@/components/frontend/form-renderer";
import { FormStatus } from "@/generated/prisma/client";
import {
  parseStoredFormFields,
  parseStoredFormSubmit,
} from "@/lib/forms/parse-form-json";
import { resolveSeoTitle } from "@/lib/meta/seo";
import { prisma } from "@/lib/prisma";
import { getGlobalSettings } from "@/lib/settings";

async function getActiveForm(slug: string) {
  return prisma.form.findFirst({
    where: {
      slug,
      status: FormStatus.ACTIVE,
    },
  });
}

type Args = {
  params: Promise<{ slug: string }>;
};

export default async function PublicFormPage({ params }: Args) {
  const { slug } = await params;
  const form = await getActiveForm(slug);

  if (!form) {
    notFound();
  }

  const fields = parseStoredFormFields(form.fields);
  const submit = parseStoredFormSubmit(form.submit);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{form.title}</h1>
      <PublicFormRenderer
        slug={form.slug}
        title={form.title}
        fields={fields}
        submit={submit}
      />
    </div>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const [form, globalSettings] = await Promise.all([
    getActiveForm(slug),
    getGlobalSettings(),
  ]);

  if (!form) {
    return {
      title: globalSettings.siteTitle,
    };
  }

  return {
    title: resolveSeoTitle([], form.title),
  };
}
