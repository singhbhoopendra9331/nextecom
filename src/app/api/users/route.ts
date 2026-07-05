import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/require-auth";

export async function GET() {
  const auth = await requireApiPermission("users:manage");
  if (auth.response) {
    return auth.response;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ docs: users });
  } catch (error: unknown) {
    console.error("GET /api/users:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch users";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
