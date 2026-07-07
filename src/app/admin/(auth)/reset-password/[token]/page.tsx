import Link from "next/link";

import { getPasswordResetToken } from "@/actions/auth/reset-password";
import { AuthShell } from "@/components/admin/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";

import ResetPasswordTokenPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Set New Password",
  "Choose a new password for your account."
);

export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resetToken = await getPasswordResetToken(token);

  if (!resetToken) {
    return (
      <AuthShell
        title="Invalid reset link"
        description="This password reset link is invalid or has expired"
      >
        <Alert variant="destructive">
          <AlertDescription>
            Request a new reset link and try again.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/admin/reset-password">Request new link</Link>
        </Button>
      </AuthShell>
    );
  }

  return <ResetPasswordTokenPageClient token={token} />;
}
