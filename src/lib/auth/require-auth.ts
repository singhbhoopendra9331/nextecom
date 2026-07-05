import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import type { SessionUser } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session";
import {
  canAccessRoute,
  getRoutePermission,
  hasPermission,
  type Permission,
} from "@/lib/auth/permissions";

export type AuthFailure = {
  ok: false;
  error: "Unauthorized" | "Forbidden";
};

export type AuthSuccess = {
  ok: true;
  session: SessionUser;
};

export type AuthResult = AuthSuccess | AuthFailure;

export async function authorize(permission: Permission): Promise<AuthResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!hasPermission(session.role, permission)) {
    return { ok: false, error: "Forbidden" };
  }

  return { ok: true, session };
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const result = await authorize(permission);

  if (!result.ok) {
    if (result.error === "Unauthorized") {
      redirect("/admin/login");
    }

    redirect("/admin/forbidden");
  }

  return result.session;
}

export async function guardRouteAccess(pathname: string): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!canAccessRoute(session.role, pathname)) {
    redirect("/admin/forbidden");
  }

  return session;
}

export async function requireApiPermission(permission: Permission) {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasPermission(session.role, permission)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, response: null };
}

export async function requireApiRouteAccess(pathname: string) {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const permission = getRoutePermission(pathname);

  if (permission && !hasPermission(session.role, permission)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, response: null };
}

export async function requireApiSession() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
}

export function authErrorResult(result: AuthFailure) {
  return {
    success: false as const,
    error: result.error,
  };
}
