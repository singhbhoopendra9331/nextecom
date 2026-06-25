"use server";

import { randomBytes } from "node:crypto";

import { requestPasswordResetSchema } from "@/lib/auth/schemas";
import { getAppBaseUrl } from "@/lib/email/send-mail";
import { sendTemplatedMail } from "@/lib/email/send-templated-mail";
import { prisma } from "@/lib/prisma";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordResetAction(input: { email: string }) {
  const parsed = requestPasswordResetSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${getAppBaseUrl()}/admin/reset-password/${token}`;
    const mailResult = await sendTemplatedMail({
      to: user.email,
      template: "reset-password",
      placeholders: {
        resetUrl,
        expiresIn: "1 hour",
      },
    });

    if (!mailResult.sent) {
      console.info("[password-reset] reset link:", resetUrl);
    }
  }

  return {
    success: true as const,
    message:
      "If an account exists for that email, a reset link has been sent.",
  };
}
