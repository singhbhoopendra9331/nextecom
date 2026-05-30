import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import UserForm from "../user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <UserForm
      mode="edit"
      userId={user.id}
      initialValues={{
        name: user.name,
        email: user.email,
      }}
    />
  );
}
