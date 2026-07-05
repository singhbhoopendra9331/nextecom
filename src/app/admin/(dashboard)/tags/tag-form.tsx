"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createTag } from "@/actions/tags/create-tag";
import { updateTag } from "@/actions/tags/update-tag";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export type TagRow = {
  id: string;
  name: string;
  postCount: number;
};

const tagFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

type TagFormInput = z.infer<typeof tagFormSchema>;

type TagFormProps = {
  mode: "create" | "edit";
  tag?: TagRow;
  onSuccess?: () => void;
};

export default function TagForm({ mode, tag, onSuccess }: TagFormProps) {
  const [isSubmitting, startSubmitTransition] = useTransition();

  const form = useForm<TagFormInput>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: tag?.name ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: tag?.name ?? "",
    });
  }, [tag?.id, tag?.name, form.reset]);

  function onSubmit(values: TagFormInput) {
    startSubmitTransition(async () => {
      const res =
        mode === "edit" && tag
          ? await updateTag(tag.id, { name: values.name })
          : await createTag({ name: values.name });

      if (res.success) {
        toast.success(
          mode === "create"
            ? "Tag created successfully"
            : "Tag updated successfully"
        );
        onSuccess?.();
        return;
      }

      toast.error(res.error ?? `Failed to ${mode} tag`);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 px-4"
    >
      <TextField
        name="name"
        control={form.control}
        label="Name"
        placeholder="Enter tag name"
        autoFocus
        required
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
            ? "Create Tag"
            : "Update Tag"}
      </Button>
    </form>
  );
}
