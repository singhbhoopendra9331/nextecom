import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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
