import { Button } from "@/components/ui/button";
import Link from "next/link"; 
import { axios } from "@/lib/axios";
import PostPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

export default async function Page() {
  const posts = await axios.get("/api/posts");
  if (!posts.data) throw new Error("Failed to fetch posts");
  console.log("posts >>", posts.data);

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">

      <PageTitle title="Posts" description="Manage your posts">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/posts/create">Add Post</Link>
        </Button>
      </PageTitle>

      <PostPageClient initialData={posts.data} />   
    </div>
  );
}