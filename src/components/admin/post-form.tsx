"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createPost } from "@/actions/posts/create-post";
import { updatePost } from "@/actions/posts/update-post";
import Editor from "@/components/editor";
import { MediaPicker } from "@/components/media-picker";
import { AppSelect, type SelectOption } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PostStatus } from "@/generated/prisma/enums";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

type Author = {
  id: string;
  name: string | null;
  email: string;
};

type FeaturedImage = {
  id: string;
  url: string;
  originalName: string;
};

type TaxonomyOption = {
  id: string;
  name: string;
};

export type PostFormInitialValues = {
  title?: string;
  content?: unknown;
  authorId?: string;
  status?: PostStatus;
  featuredImageId?: string | null;
  featuredImage?: FeaturedImage | null;
  tagIds?: string[];
  categoryIds?: string[];
};

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: PostFormInitialValues;
  tags?: TaxonomyOption[];
  categories?: TaxonomyOption[];
};

function CheckboxGroupField({
  label,
  options,
  value,
  onChange,
  emptyMessage,
}: {
  label: string;
  options: TaxonomyOption[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyMessage?: string;
}) {
  function toggle(id: string) {
    onChange(
      value.includes(id)
        ? value.filter((item) => item !== id)
        : [...value, id]
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? "None available."}
        </p>
      ) : (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={value.includes(option.id)}
                onCheckedChange={() => toggle(option.id)}
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const statusOptions: SelectOption[] = [
  { value: PostStatus.DRAFT, label: "Draft" },
  { value: PostStatus.PUBLISHED, label: "Published" },
  { value: PostStatus.ARCHIVED, label: "Archived" },
];

export default function PostForm({
  mode,
  postId,
  initialValues,
  tags = [],
  categories = [],
}: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState<unknown>(
    initialValues?.content ?? null
  );
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(
    initialValues?.featuredImageId ?? null
  );
  const [featuredImage, setFeaturedImage] = useState<FeaturedImage | null>(
    initialValues?.featuredImage ?? null
  );
  const [authorId, setAuthorId] = useState(initialValues?.authorId ?? "");
  const [status, setStatus] = useState<PostStatus>(
    initialValues?.status ?? PostStatus.DRAFT
  );
  const [tagIds, setTagIds] = useState<string[]>(initialValues?.tagIds ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialValues?.categoryIds ?? []
  );
  const [authors, setAuthors] = useState<SelectOption[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTagIds(initialValues?.tagIds ?? []);
    setCategoryIds(initialValues?.categoryIds ?? []);
  }, [postId, initialValues?.tagIds, initialValues?.categoryIds]);

  useEffect(() => {
    axios
      .get<{ docs: Author[] }>("/api/users")
      .then((res) => {
        setAuthors(
          res.data.docs.map((user) => ({
            value: user.id,
            label: user.name || user.email,
          }))
        );
      })
      .catch(() => {
        setAuthors([]);
      })
      .finally(() => {
        setIsLoadingAuthors(false);
      });
  }, []);

  async function handleSubmit() {
    if (!authorId) {
      toast.error("Please select an author");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      content,
      authorId,
      status,
      featuredImageId,
      tags: tagIds,
      categories: categoryIds,
    };

    const res =
      mode === "edit" && postId
        ? await updatePost(postId, payload)
        : await createPost(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create" ? "Post created successfully" : "Post updated successfully"
      );
      router.push("/admin/posts");
      return;
    }

    toast.error(res.error ?? "Something went wrong");
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">
          {mode === "create" ? "Create Post" : "Edit Post"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/posts">Back to Posts</Link>
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
              placeholder="Enter post title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <Editor
              key={postId ?? "new-post"}
              onChange={setContent}
              initialContent={initialValues?.content}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-4">
          <AppSelect
            label="Author"
            placeholder={
              isLoadingAuthors ? "Loading authors..." : "Select author"
            }
            options={authors}
            value={authorId}
            onValueChange={setAuthorId}
            disabled={isLoadingAuthors || authors.length === 0}
          />

          <AppSelect
            label="Status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value as PostStatus)}
          />

          <CheckboxGroupField
            label="Tags"
            options={tags}
            value={tagIds}
            onChange={setTagIds}
            emptyMessage="No tags yet. Add tags from the Tags page."
          />

          <CheckboxGroupField
            label="Categories"
            options={categories}
            value={categoryIds}
            onChange={setCategoryIds}
            emptyMessage="No categories yet. Add categories from the Categories page."
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
                  ? "Save Post"
                  : "Update Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
