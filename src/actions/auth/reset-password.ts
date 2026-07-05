"use server";

import { redirect } from "next/navigation";

import { resetPasswordSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function resetPasswordAction(
  token: string,
  input: { password: string; confirmPassword: string }
) {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: {
      id: true,
      expiresAt: true,
      userId: true,
    },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return {
      success: false as const,
      error: "This reset link is invalid or has expired",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashPassword(parsed.data.password),
        sessionVersion: {
          increment: 1,
        },
      },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  redirect("/admin/login?reset=success");
}

export async function getPasswordResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: {
      expiresAt: true,
    },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return null;
  }

  return resetToken;
}
