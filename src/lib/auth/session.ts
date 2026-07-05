import { cookies } from "next/headers";

import { UserRole } from "@/generated/prisma/client";
import {
  encodeSession,
  parseSessionToken,
} from "@/lib/auth/session-token";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/constants/index";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  sessionVersion: number;
};

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      sessionVersion: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    sessionVersion: user.sessionVersion,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await encodeSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function bumpSessionVersion(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await parseSessionToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      sessionVersion: true,
    },
  });

  if (!user || user.sessionVersion !== payload.sessionVersion) {
    return null;
  }

  return user;
}
