"use server";

import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/schemas";
import { getAppBaseUrl } from "@/lib/email/send-mail";
import { sendTemplatedMail } from "@/lib/email/send-templated-mail";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  enforceAuthRateLimit,
  rateLimitActionError,
} from "@/lib/rate-limit";

export async function registerAction(input: {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const rateLimited = await enforceAuthRateLimit(email);
  if (rateLimited) {
    return rateLimitActionError(rateLimited);
  }

  const existingUsers = await prisma.user.count();
  const role = existingUsers === 0 ? UserRole.SUPER_ADMIN : UserRole.EDITOR;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        password: hashPassword(parsed.data.password),
        role,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await createSession(user.id);

    void sendTemplatedMail({
      to: user.email,
      template: "welcome",
      placeholders: {
        name: user.name?.trim() || "there",
        loginUrl: `${getAppBaseUrl()}/admin/login`,
      },
    });
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
      error: "Failed to create account",
    };
  }

  redirect("/admin");
}
