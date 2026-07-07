import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await requireApiPermission("forms:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const where: Prisma.FormWhereInput = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [docs, total] = await Promise.all([
    prisma.form.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
    prisma.form.count({ where }),
  ]);

  return NextResponse.json({
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
