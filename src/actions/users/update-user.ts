"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

type Input = {
  email: string;
  name?: string;
  password?: string;
};

export async function updateUser(id: string, data: Input) {
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email.trim(),
        name: data.name?.trim() || null,
        ...(data.password ? { password: hashPassword(data.password) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
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
