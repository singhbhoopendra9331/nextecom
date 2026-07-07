"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createForm } from "@/actions/forms/create-form";
import { updateForm } from "@/actions/forms/update-form";
import FormBuilder from "@/components/admin/form-builder";
import FormSettingsFields from "@/components/admin/form-settings-fields";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStatus } from "@/generated/prisma/enums";
import {
  DEFAULT_FORM_EMAIL_SETTINGS,
  DEFAULT_FORM_SUBMIT_SETTINGS,
} from "@/lib/forms/defaults";
import { toast } from "@/lib/toast";
import type {
  FormEmailSettings,
  FormFieldDefinition,
  FormSubmitSettings,
} from "@/types/forms";

export type CmsFormInitialValues = {
  title?: string;
  slug?: string;
  status?: FormStatus;
  fields?: FormFieldDefinition[];
  email?: FormEmailSettings | null;
  submit?: FormSubmitSettings;
};

type CmsFormEditorProps = {
  mode: "create" | "edit";
  formId?: string;
  initialValues?: CmsFormInitialValues;
};

const STATUS_OPTIONS = [
  { value: FormStatus.ACTIVE, label: "Active" },
  { value: FormStatus.INACTIVE, label: "Inactive" },
];

export default function CmsFormEditor({
  mode,
  formId,
  initialValues,
}: CmsFormEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [status, setStatus] = useState<FormStatus>(
    initialValues?.status ?? FormStatus.ACTIVE
  );
  const [fields, setFields] = useState<FormFieldDefinition[]>(
    initialValues?.fields ?? []
  );
  const [email, setEmail] = useState<FormEmailSettings>(
    initialValues?.email ?? DEFAULT_FORM_EMAIL_SETTINGS
  );
  const [submit, setSubmit] = useState<FormSubmitSettings>(
    initialValues?.submit ?? DEFAULT_FORM_SUBMIT_SETTINGS
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (fields.length === 0) {
      toast.error("Add at least one field");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      slug: slug.trim() || undefined,
      status,
      fields,
      email,
      submit,
    };

    const res =
      mode === "edit" && formId
        ? await updateForm(formId, payload)
        : await createForm(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create" ? "Form created successfully" : "Form updated successfully"
      );
      router.push("/admin/forms");
      return;
    }

    toast.error(res.error ?? "Something went wrong");
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">
          {mode === "create" ? "Create Form" : "Edit Form"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/forms">Back to Forms</Link>
        </Button>
        {mode === "edit" && formId ? (
          <Button variant="outline" asChild>
            <Link href={`/admin/forms/${formId}/submissions`}>View Submissions</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div className="space-y-2">
            <Label htmlFor="form-title">Title</Label>
            <Input
              id="form-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contact form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-slug">Slug</Label>
            <Input
              id="form-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="contact (auto-generated if empty)"
            />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Fields</h2>
            <FormBuilder fields={fields} onChange={setFields} />
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <AppSelect
            label="Status"
            value={status}
            onValueChange={(value) => setStatus(value as FormStatus)}
            options={STATUS_OPTIONS}
          />

          <FormSettingsFields
            fields={fields}
            email={email}
            submit={submit}
            onEmailChange={setEmail}
            onSubmitChange={setSubmit}
          />

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Save Form"
                  : "Update Form"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
