import { AuthShell } from "@/components/admin/auth-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
