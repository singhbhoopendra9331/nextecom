import Link from "next/link";

import { axios } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import PagesPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

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
      <PageTitle title="Pages" description="Manage your pages">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/pages/create">Add Page</Link>
        </Button>
      </PageTitle>
      <PagesPageClient initialData={pages} />
    </div>
  );
}
