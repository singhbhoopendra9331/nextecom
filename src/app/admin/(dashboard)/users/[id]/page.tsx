import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { UserRole } from "@/generated/prisma/client";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

import UserForm from "../user-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  });

  if (!user) {
    return createAdminMetadata("Edit User", "Edit a user account.");
  }

  const label = user.name || user.email;
  return createAdminMetadata(`Edit User: ${label}`, `Edit "${label}".`);
}

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
