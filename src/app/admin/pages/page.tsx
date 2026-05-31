import { Button } from "@/components/ui/button";
import Link from "next/link";
import { axios } from "@/lib/axios";
import PagesPageClient from "./page.client";

export default async function Page() {
  const pages = await axios.get("/api/pages");
  if (!pages.data) throw new Error("Failed to fetch pages");

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <h1 className="font-semibold text-2xl flex items-center gap-4">
        Pages
        <Button variant="outline" asChild>
          <Link href="/admin/pages/create">Add Page</Link>
        </Button>
      </h1>

      <PagesPageClient initialData={pages.data} />
    </div>
  );
}
