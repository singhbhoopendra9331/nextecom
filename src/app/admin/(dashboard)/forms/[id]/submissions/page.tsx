import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

import FormSubmissionsPageClient from "./page.client";

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
    return createAdminMetadata("Form Submissions", "View form submissions.");
  }

  return createAdminMetadata(
    `Submissions: ${form.title}`,
    `View submissions for "${form.title}".`
  );
}

export default async function FormSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!form) {
    notFound();
  }

  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where: { formId: id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.formSubmission.count({
      where: { formId: id },
    }),
  ]);

  return (
    <div className="min-h-screen space-y-6 p-2 md:p-4">
      <PageTitle
        title={`Submissions: ${form.title}`}
        description="Review submitted form entries."
      >
        <Button size="sm" variant="outline" asChild>
          <Link href={`/admin/forms/${form.id}/edit`}>Back to Form</Link>
        </Button>
      </PageTitle>
      <FormSubmissionsPageClient
        formId={form.id}
        initialData={{
          docs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }}
      />
    </div>
  );
}
