import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth/session";
import { createAdminMetadata } from "@/lib/admin/metadata";

import UserForm from "../user-form";

export const metadata = createAdminMetadata("Create User", "Add a new user account.");

function getAssignableRoles(role?: UserRole) {
  if (role === UserRole.SUPER_ADMIN) {
    return [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER];
  }

  if (role === UserRole.ADMIN) {
    return [UserRole.EDITOR, UserRole.VIEWER];
  }

  return [];
}

export default async function CreateUserPage() {
  const session = await getSession();

  return (
    <UserForm
      mode="create"
      assignableRoles={getAssignableRoles(session?.role)}
    />
  );
}
