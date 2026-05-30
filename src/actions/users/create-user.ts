"use server";

import { randomBytes, scryptSync } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Input = {
  email: string;
  name?: string;
  password: string;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function createUser(data: Input) {
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

    const user = await prisma.user.create({
      data: {
        email: data.email.trim(),
        name: data.name?.trim() || null,
        password: hashPassword(data.password),
      },
      select: {
        id: true,
        email: true,
        name: true,
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
