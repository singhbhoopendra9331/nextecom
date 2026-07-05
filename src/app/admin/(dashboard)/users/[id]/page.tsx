import { notFound } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <UserForm
      mode="edit"
      userId={user.id}
      assignableRoles={getAssignableRoles(session?.role)}
      initialValues={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    />
  );
}
