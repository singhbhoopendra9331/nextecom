import Link from "next/link";

import { axios } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import PagesPageClient from "./page.client";

const getPages = async () => {
  const pages = await axios.get("/api/pages");
  console.log("pages >>", pages.data);
  if (!pages.data) throw new Error("Failed to fetch pages");
  return pages.data;
}

export default async function Page() {
  const pages = await getPages();

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <h1 className="font-semibold text-2xl flex items-center gap-4">
        Pages
        <Button variant="outline" asChild>
          <Link href="/admin/pages/create">Add Page</Link>
        </Button>
      </h1>

      <PagesPageClient initialData={pages} />
    </div>
  );
}
