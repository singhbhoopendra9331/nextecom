"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createPage } from "@/actions/pages/create";
import { updatePage } from "@/actions/pages/update";
import Editor from "@/components/editor";
import { MediaPicker } from "@/components/media-picker";
import { AppSelect, type SelectOption } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostStatus } from "@/generated/prisma/enums";
import { toast } from "@/lib/toast";

type FeaturedImage = {
  id: string;
  url: string;
  originalName: string;
};

export type PageFormInitialValues = {
  title?: string;
  content?: unknown;
  status?: PostStatus;
  featuredImageId?: string | null;
  featuredImage?: FeaturedImage | null;
};

type PageFormProps = {
  mode: "create" | "edit";
  pageId?: string;
  initialValues?: PageFormInitialValues;
};

const statusOptions: SelectOption[] = [
  { value: PostStatus.DRAFT, label: "Draft" },
  { value: PostStatus.PUBLISHED, label: "Published" },
  { value: PostStatus.ARCHIVED, label: "Archived" },
];

export default function PageForm({
  mode,
  pageId,
  initialValues,
}: PageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState<unknown>(
    initialValues?.content ?? null
  );
  const [status, setStatus] = useState<PostStatus>(
    initialValues?.status ?? PostStatus.DRAFT
  );
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(
    initialValues?.featuredImageId ?? null
  );
  const [featuredImage, setFeaturedImage] = useState<FeaturedImage | null>(
    initialValues?.featuredImage ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      content,
      status,
      featuredImageId,
    };

    const res =
      mode === "edit" && pageId
        ? await updatePage(pageId, payload)
        : await createPage(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create"
          ? "Page created successfully"
          : "Page updated successfully"
      );
      router.push("/admin/pages");
      return;
    }

    toast.error(res.error ?? "Something went wrong");
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">
          {mode === "create" ? "Create Page" : "Edit Page"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/pages">Back to Pages</Link>
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 border-r pr-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter page title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <Editor
              key={pageId ?? "new-page"}
              onChange={setContent}
              initialContent={initialValues?.content}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-4">
          <AppSelect
            label="Status"
            placeholder="Select status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value as PostStatus)}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Featured Image
            </label>
            <MediaPicker
              value={featuredImage}
              onChange={(media) => {
                setFeaturedImage(media);
                setFeaturedImageId(media?.id ?? null);
              }}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Save Page"
                  : "Update Page"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
