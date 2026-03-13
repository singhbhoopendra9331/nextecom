"use client";

import Editor from "@/components/editor";
import { MediaPicker } from "@/components/media-picker";
import { Button } from "@/components/ui/button"; 


export default function CreatePostPage() {

  return (
    <div className="min-h-screen p-2 md:p-4">
      <h1 className="font-semibold text-2xl mb-4">Create Post</h1>

      {/* two column layout */}
      <div className="grid grid-cols-12 gap-4">

        <div className="col-span-12 md:col-span-8 border-r pr-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>

            <input
              type="text"
              id="title"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter post title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="content">Content</label>
 
            <Editor />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          {/* featured image, use media selector or picker */}
          <MediaPicker />

          <div className="flex justify-end mt-4">
            <Button>
              Save Post
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
