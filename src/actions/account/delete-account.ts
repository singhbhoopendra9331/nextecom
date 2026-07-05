"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { deleteAccountSchema } from "@/lib/auth/schemas";
import { destroySession, getSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function deleteAccountAction(input: {
  password: string;
  confirmation: string;
}) {
  const session = await getSession();

  if (!session) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = deleteAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      password: true,
      role: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!user) {
    return { success: false as const, error: "User not found" };
  }

  if (!verifyPassword(parsed.data.password, user.password)) {
    return {
      success: false as const,
      error: "Password is incorrect",
    };
  }

  if (user._count.posts > 0) {
    return {
      success: false as const,
      error:
        "You have published content linked to your account. Ask an admin to reassign or remove your posts before deleting your account.",
    };
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    const superAdminCount = await prisma.user.count({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (superAdminCount <= 1) {
      return {
        success: false as const,
        error:
          "You are the only super admin. Assign another super admin before deleting your account.",
      };
    }
  }

  await prisma.user.delete({
    where: { id: session.id },
  });

  await destroySession();
  redirect("/admin/login?deleted=1");
}
