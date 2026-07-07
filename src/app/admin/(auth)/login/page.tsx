import { Suspense } from "react";

import { createAdminMetadata } from "@/lib/admin/metadata";

import LoginPageClient from "./page.client";

export const metadata = createAdminMetadata("Login", "Sign in to the admin dashboard.");

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
