import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata("Coupons", "Manage your coupons.");

export default async function Page() {

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Coupons" description="Manage your coupons">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/coupons/create">Add Coupon</Link>
        </Button>
      </PageTitle>
    </div>
  );
}
