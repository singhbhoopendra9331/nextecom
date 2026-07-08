import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata"; 

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title={`Product - ${slug}`} description={`Manage your product: ${slug}.`}/>
    </div>
  );
}
