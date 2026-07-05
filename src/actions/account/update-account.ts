"use server";

import { revalidatePath } from "next/cache";

import { updateAccountSchema } from "@/lib/auth/schemas";
import { createSession, getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function updateAccountAction(input: {
  name?: string;
  email: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
}) {
  const session = await getSession();

  if (!session) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = updateAccountSchema.safeParse(input);

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
      email: true,
      password: true,
    },
  });

  if (!user) {
    return { success: false as const, error: "User not found" };
  }

  const nextEmail = parsed.data.email.trim().toLowerCase();
  const emailChanged = nextEmail !== user.email;
  const passwordChanged = Boolean(parsed.data.password?.trim());

  if (emailChanged || passwordChanged) {
    if (
      !parsed.data.currentPassword ||
      !verifyPassword(parsed.data.currentPassword, user.password)
    ) {
      return {
        success: false as const,
        error: "Current password is incorrect",
      };
    }
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name?.trim() || null,
        email: nextEmail,
        ...(passwordChanged
          ? { password: hashPassword(parsed.data.password!) }
          : {}),
        ...(emailChanged || passwordChanged
          ? {
              sessionVersion: {
                increment: 1,
              },
            }
          : {}),
      },
    });

    if (emailChanged || passwordChanged) {
      await createSession(session.id);
    }

    revalidatePath("/admin/account");

    return { success: true as const };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "A user with this email already exists",
      };
    }

    return {
      success: false as const,
      error: "Failed to update account",
    };
  }
}
