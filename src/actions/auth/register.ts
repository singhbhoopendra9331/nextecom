"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

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

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        password: hashPassword(parsed.data.password),
      },
      select: { id: true },
    });

    await createSession(user.id);
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
