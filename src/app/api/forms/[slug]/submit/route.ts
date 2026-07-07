import { submitForm } from "@/actions/forms/submit-form";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { slug } = await context.params;

  let body: { data?: unknown; source?: string | null };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await submitForm({
    slug,
    data: body.data ?? {},
    source: body.source,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
