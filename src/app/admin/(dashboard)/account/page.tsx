import { notFound, redirect } from "next/navigation";

import { createAdminMetadata } from "@/lib/admin/metadata";
import { getSession } from "@/lib/auth/session";

import AccountPageClient from "./page.client";

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
    <AccountPageClient
      initialValues={{
        name: session.name ?? "",
        email: session.email,
        role: session.role,
      }}
    />
  );
}
