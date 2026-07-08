import { notFound, redirect } from "next/navigation";

import { createAdminMetadata } from "@/lib/admin/metadata";
import { getSession } from "@/lib/auth/session";

import AccountPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

export const metadata = createAdminMetadata(
  "Account",
  "Manage your admin account settings."
);

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login?next=/admin/account");
  }

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-4">
      <PageTitle title="Account" description="Manage your account settings" />
      <AccountPageClient
        initialValues={{
          name: session.name ?? "",
          email: session.email,
          role: session.role,
        }}
      />
    </div>
  );
}
