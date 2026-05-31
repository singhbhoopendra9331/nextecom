import Link from "next/link";

import { axios } from "@/lib/axios";

import { Button } from "@/components/ui/button";
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
      <h1 className="font-semibold text-2xl flex items-center gap-4">
        Media
        <Button variant="outline" asChild>
          <Link href="/admin/media/create">Add Media</Link>
        </Button>
      </h1>

      <MediaPageClient initialData={initialData} />
    </div>
  );
}