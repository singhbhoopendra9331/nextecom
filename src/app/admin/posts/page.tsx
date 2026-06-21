import { Button } from "@/components/ui/button";
import Link from "next/link"; 
import { axios } from "@/lib/axios";
import PostPageClient from "./page.client";

export default async function Page() {
  const posts = await axios.get("/api/posts");
  if (!posts.data) throw new Error("Failed to fetch posts");
  console.log("posts >>", posts.data);

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <h1 className="font-semibold text-2xl flex items-center gap-4">
        Posts
        <Button variant="outline" asChild>
          <Link href="/admin/posts/create">Add Post</Link>
        </Button>
      </h1>

      <PostPageClient initialData={posts.data} />   
    </div>
  );
}