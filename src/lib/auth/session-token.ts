import type { NextRequest } from "next/server";

import { getEnv } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/constants/index";

export type SessionPayload = {
  userId: string;
  exp: number;
};

function getAuthSecret() {
  return getEnv("AUTH_SECRET");
}

function toBase64Url(bytes: Uint8Array) {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

async function signPayload(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  return toBase64Url(new Uint8Array(signature));
}

export async function encodeSession(payload: SessionPayload) {
  const data = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${data}.${await signPayload(data)}`;
}

export async function parseSessionToken(
  token: string
): Promise<SessionPayload | null> {
  const [data, signature] = token.split(".");

  if (!data || !signature) {
    return null;
  }

  const expected = await signPayload(data);
  const signatureBytes = new TextEncoder().encode(signature);
  const expectedBytes = new TextEncoder().encode(expected);

  if (!timingSafeEqual(signatureBytes, expectedBytes)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(data))
    ) as SessionPayload;

    if (!payload.userId || !payload.exp || payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}
