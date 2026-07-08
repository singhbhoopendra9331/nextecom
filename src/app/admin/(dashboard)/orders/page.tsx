import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata("Orders", "Manage your orders.");

export default async function Page() {

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Orders" description="Manage your orders">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/orders/create">Add Order</Link>
        </Button>
      </PageTitle>
    </div>
  );
}
