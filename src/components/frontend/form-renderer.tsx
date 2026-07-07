"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { submitForm } from "@/actions/forms/submit-form";
import {
  CheckboxField,
  EmailField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { buildSubmissionSchema } from "@/lib/forms/schemas";
import { toast } from "@/lib/toast";
import type { FormFieldDefinition, FormSubmitSettings } from "@/types/forms";
import type { z } from "zod";

type PublicFormRendererProps = {
  slug: string;
  title: string;
  fields: FormFieldDefinition[];
  submit: FormSubmitSettings;
};

export default function PublicFormRenderer({
  slug,
  title,
  fields,
  submit,
}: PublicFormRendererProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const schema = useMemo(() => buildSubmissionSchema(fields), [fields]);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = useMemo(() => {
    const values: FormValues = {} as FormValues;

    for (const field of fields) {
      (values as Record<string, string | boolean>)[field.name] =
        field.type === "checkbox" ? false : "";
    }

    return values;
  }, [fields]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await submitForm({
        slug,
        data: values,
        source: typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to submit form");
        return;
      }

      if (result.mode === "redirect" && result.redirectUrl) {
        if (result.redirectUrl.startsWith("http")) {
          window.location.href = result.redirectUrl;
          return;
        }

        router.push(result.redirectUrl);
        return;
      }

      const message =
        result.successMessage ?? "Thank you. Your submission has been received.";
      setSuccessMessage(message);
      toast.success(message);
      form.reset(defaultValues);
    });
  }

  if (successMessage && submit.mode === "message") {
    return (
      <div className="rounded-md border bg-muted/30 p-6">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{successMessage}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setSuccessMessage(null)}
        >
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        switch (field.type) {
          case "email":
            return (
              <EmailField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
              />
            );
          case "textarea":
            return (
              <TextareaField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
              />
            );
          case "select":
            return (
              <SelectField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                placeholder={field.placeholder ?? "Select an option"}
                options={field.options ?? []}
                required={field.required}
              />
            );
          case "checkbox":
            return (
              <CheckboxField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                required={field.required}
              />
            );
          case "number":
            return (
              <TextField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                type="number"
                placeholder={field.placeholder}
                required={field.required}
              />
            );
          case "tel":
            return (
              <TextField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                type="tel"
                placeholder={field.placeholder}
                required={field.required}
              />
            );
          default:
            return (
              <TextField
                key={field.id}
                name={field.name}
                control={form.control}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
              />
            );
        }
      })}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
