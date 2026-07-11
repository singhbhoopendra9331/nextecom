"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/schemas";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  enforceAuthRateLimit,
  rateLimitActionError,
} from "@/lib/rate-limit";

export async function loginAction(
  input: { email: string; password: string },
  nextPath?: string
) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const rateLimited = await enforceAuthRateLimit(parsed.data.email);
  if (rateLimited) {
    return rateLimitActionError(rateLimited);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user || !verifyPassword(parsed.data.password, user.password)) {
    return {
      success: false as const,
      error: "Invalid email or password",
    };
  }

  await createSession(user.id);

  const destination =
    nextPath && nextPath.startsWith("/admin") && !nextPath.startsWith("/admin/login")
      ? nextPath
      : "/admin";

  redirect(destination);
}
