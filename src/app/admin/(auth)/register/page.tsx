import { createAdminMetadata } from "@/lib/admin/metadata";

import RegisterPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Register",
  "Create a new admin account."
);

export default function RegisterPage() {
  return <RegisterPageClient />;
}
