"use server";

import { UserRole } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

type Input = {
  email: string;
  name?: string;
  password: string;
  role?: UserRole;
};

export async function createUser(data: Input) {
  const auth = await authorize("users:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!data.email?.trim()) {
      throw new Error("Email is required");
    }

    if (!data.password) {
      throw new Error("Password is required");
    }

    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const role =
      auth.session.role === UserRole.SUPER_ADMIN && data.role
        ? data.role
        : UserRole.EDITOR;

    const user = await prisma.user.create({
      data: {
        email: data.email.trim(),
        name: data.name?.trim() || null,
        password: hashPassword(data.password),
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
    };
  } catch (error: unknown) {
    console.error("createUser", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A user with this email already exists",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create user",
    };
  }
}
