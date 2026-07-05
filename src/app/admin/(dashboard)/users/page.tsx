import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import UsersPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

function getAssignableRoles(role?: UserRole) {
  if (role === UserRole.SUPER_ADMIN) {
    return [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER];
  }

  if (role === UserRole.ADMIN) {
    return [UserRole.EDITOR, UserRole.VIEWER];
  }

  return [];
}

export default async function Page() {
  const session = await getSession();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Users" description="Manage your users">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/users/create">Add User</Link>
        </Button>
      </PageTitle>
      <UsersPageClient
        users={users}
        assignableRoles={getAssignableRoles(session?.role)}
      />
    </div>
  );
}
