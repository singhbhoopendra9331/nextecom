import { headers } from "next/headers";

export function getIdentifierFromHeaders(headerStore: Headers) {
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "anonymous";

  return ip;
}

export function getIdentifierFromRequest(req: Request) {
  return getIdentifierFromHeaders(req.headers);
}

export async function getRequestIdentifier() {
  const headerStore = await headers();
  return getIdentifierFromHeaders(headerStore);
}

export function buildScopedIdentifier(scope: string, value: string) {
  return `${scope}:${value}`;
}
