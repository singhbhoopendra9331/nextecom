"use server";

import { authErrorResult, authorize } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteForm(id: string) {
  const auth = await authorize("forms:write");
  if (!auth.ok) {
    return authErrorResult(auth);
  }

  try {
    await prisma.form.delete({
      where: { id },
    });

    revalidatePath("/admin/forms");

    return {
      success: true as const,
    };
  } catch (error: unknown) {
    console.error("deleteForm", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete form",
    };
  }
}
