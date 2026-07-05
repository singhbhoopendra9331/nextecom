import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth/session";

import UserForm from "../user-form";

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
