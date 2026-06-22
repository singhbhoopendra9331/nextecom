import Link from "next/link";

import { axios } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import MediaPageClient from "./page.client";

async function getMedia(q: string) {
  const res = await axios.get(
    `/api/media?page=1&limit=20&q=${q}`
  );
  if (!res.data) throw new Error("Failed to fetch media");
  return res.data;
}

export default async function Page() {
  const initialData = await getMedia("");
  // get query params on server

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6"> 
      <PageTitle title="Media" description="Manage your media">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/media/create">Add Media</Link>
        </Button>
      </PageTitle>

      <MediaPageClient initialData={initialData} />
    </div>
  );
}