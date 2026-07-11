import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const auth = await requireApiPermission("forms:read");
  if (auth.response) {
    return auth.response;
  }

  const { formId } = await context.params;
  const { searchParams } = new URL(req.url);

  const { page, limit, skip } = parsePaginationParams(
    searchParams.get("page"),
    searchParams.get("limit")
  );

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const [docs, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where: { formId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.formSubmission.count({
      where: { formId },
    }),
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
