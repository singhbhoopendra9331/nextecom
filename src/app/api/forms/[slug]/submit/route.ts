import { submitForm } from "@/actions/forms/submit-form";
import {
  enforceRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { getIdentifierFromRequest } from "@/lib/rate-limit/identifier";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const rateLimited = await enforceRateLimit(
    "submit",
    getIdentifierFromRequest(req)
  );
  if (rateLimited) {
    return rateLimitResponse(rateLimited);
  }

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
