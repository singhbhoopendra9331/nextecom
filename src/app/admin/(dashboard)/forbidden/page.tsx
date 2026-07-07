import { AuthShell } from "@/components/admin/auth-shell";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";
import Link from "next/link";

export const metadata = createAdminMetadata(
  "Access Denied",
  "You do not have permission to view this page."
);

export default function ForbiddenPage() {
  return (
    <AuthShell
      title="Access denied"
      description="You do not have permission to view this page."
      footer={
        <Link href="/admin" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      }
    >
      <Button asChild className="w-full">
        <Link href="/admin">Go to dashboard</Link>
      </Button>
    </AuthShell>
  );
}
