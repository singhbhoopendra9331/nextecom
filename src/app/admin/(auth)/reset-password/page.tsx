import { createAdminMetadata } from "@/lib/admin/metadata";

import ResetPasswordPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Reset Password",
  "Request a password reset link."
);

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
