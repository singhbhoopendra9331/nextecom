import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/session-token";
import {
  findRedirectRule,
  getActiveRedirectRules,
} from "@/lib/redirects";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/register",
  "/admin/reset-password",
];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function shouldSkipRedirectCheck(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function buildRedirectDestination(request: NextRequest, target: string) {
  const destination = target.startsWith("http://") || target.startsWith("https://")
    ? new URL(target)
    : new URL(target, request.url);

  destination.search = request.nextUrl.search;

  return destination;
}

async function applyConfiguredRedirect(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipRedirectCheck(pathname)) {
    return null;
  }

  const rules = await getActiveRedirectRules();
  const rule = findRedirectRule(pathname, rules);

  if (!rule) {
    return null;
  }

  return NextResponse.redirect(
    buildRedirectDestination(request, rule.to),
    rule.type
  );
}

async function handleAdminRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isPublic = isPublicAdminPath(pathname);

  if (isPublic) {
    if (
      session &&
      (pathname === "/admin/login" || pathname === "/admin/register")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    const redirectResponse = await applyConfiguredRedirect(request);
    return redirectResponse ?? NextResponse.next();
  }

  return handleAdminRequest(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
