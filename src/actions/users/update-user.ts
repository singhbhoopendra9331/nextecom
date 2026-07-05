"use server";

import { UserRole } from "@/generated/prisma/client";
import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

type Input = {
  email: string;
  name?: string;
  password?: string;
  role?: UserRole;
};

export async function updateUser(id: string, data: Input) {
  const auth = await authorize("users:manage");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("User id is required");
    }

    if (!data.email?.trim()) {
      throw new Error("Email is required");
    }

    if (data.password && data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        sessionVersion: true,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const nextRole =
      data.role &&
      auth.session.role === UserRole.SUPER_ADMIN &&
      data.role !== existingUser.role
        ? data.role
        : undefined;

    const shouldBumpSession =
      Boolean(data.password) ||
      (nextRole !== undefined && nextRole !== existingUser.role);

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email.trim(),
        name: data.name?.trim() || null,
        ...(data.password ? { password: hashPassword(data.password) } : {}),
        ...(nextRole ? { role: nextRole } : {}),
        ...(shouldBumpSession
          ? {
              sessionVersion: {
                increment: 1,
              },
            }
          : {}),
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
    revalidatePath(`/admin/users/${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error: unknown) {
    console.error("updateUser", error);

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
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}
