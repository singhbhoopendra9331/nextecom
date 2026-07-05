"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePage(id: string) {
  const auth = await authorize("pages:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    if (!id) {
      throw new Error("Page id is required");
    }

    await prisma.page.delete({ where: { id } });

    revalidatePath("/admin/pages");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("deletePage", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete page",
    };
  }
}
