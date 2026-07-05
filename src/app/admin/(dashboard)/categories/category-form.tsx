"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createCategory } from "@/actions/categories/create-category";
import { updateCategory } from "@/actions/categories/update-category";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export type CategoryRow = {
  id: string;
  name: string;
  postCount: number;
};

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

type CategoryFormInput = z.infer<typeof categoryFormSchema>;

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: CategoryRow;
  onSuccess?: () => void;
};

export default function CategoryForm({
  mode,
  category,
  onSuccess,
}: CategoryFormProps) {
  const [isSubmitting, startSubmitTransition] = useTransition();

  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: category?.name ?? "",
    });
  }, [category?.id, category?.name, form.reset]);

  function onSubmit(values: CategoryFormInput) {
    startSubmitTransition(async () => {
      const res =
        mode === "edit" && category
          ? await updateCategory(category.id, { name: values.name })
          : await createCategory({ name: values.name });

      if (res.success) {
        toast.success(
          mode === "create"
            ? "Category created successfully"
            : "Category updated successfully"
        );
        onSuccess?.();
        return;
      }

      toast.error(res.error ?? `Failed to ${mode} category`);
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
        placeholder="Enter category name"
        autoFocus
        required
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
            ? "Create Category"
            : "Update Category"}
      </Button>
    </form>
  );
}
