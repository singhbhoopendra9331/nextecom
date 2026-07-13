import { Prisma } from "@/generated/prisma/client";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { serializeProductForClient } from "@/lib/products/serialize-product";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await requireApiPermission("products:read");
  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);

  const { page, limit, skip } = parsePaginationParams(
    searchParams.get("page"),
    searchParams.get("limit")
  );
  const search = searchParams.get("search") || "";

  const where: Prisma.ProductWhereInput = search
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
          {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [docs, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        featuredImage: {
          select: { id: true, url: true },
        },
        brand: {
          select: { id: true, name: true },
        },
        categories: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    docs: docs.map(serializeProductForClient),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
