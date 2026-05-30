"use client";

import { useEffect, useState } from "react";
import Editor from "@/components/editor";
import { MediaPicker } from "@/components/media-picker";
import { AppSelect, type SelectOption } from "@/components/select";
import { Button } from "@/components/ui/button";
import { createPost } from "@/actions/posts/create-post";
import { Input } from "@/components/ui/input";
import { axios } from "@/lib/axios";

type Author = {
  id: string;
  name: string | null;
  email: string;
};

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState("");
  const [authors, setAuthors] = useState<SelectOption[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

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
      alert("Please select an author");
      return;
    }

    const res = await createPost({
      title,
      content,
      authorId,
      featuredImageId,
    });

    if (res.success) {
      alert("Post created");
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <h1 className="font-semibold text-2xl mb-4">Create Post</h1>

      <div className="grid grid-cols-12 gap-4">
        
        <div className="col-span-12 md:col-span-8 border-r pr-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Title
            </label>

            <Input
              type="text"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter post title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Content
            </label>

            <Editor onChange={setContent} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-4">
          <AppSelect
            label="Author"
            placeholder={isLoadingAuthors ? "Loading authors..." : "Select author"}
            options={authors}
            value={authorId}
            onValueChange={setAuthorId}
            disabled={isLoadingAuthors || authors.length === 0}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Featured Image
            </label>
            <MediaPicker
              onChange={(media) => setFeaturedImageId(media?.id ?? null)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit}>
              Save Post
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}