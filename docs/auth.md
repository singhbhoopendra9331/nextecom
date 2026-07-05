# Authentication

NextEcom uses a **custom, cookie-based session** system for the admin dashboard. There is no third-party auth provider (NextAuth, Clerk, etc.) — credentials are stored in Postgres, validated via server actions, and access is gated by a signed session cookie.

This document describes the strategy, architecture, and how to extend auth safely.

---

## Strategy

### Goals

| Goal | Approach |
|------|----------|
| Keep the stack simple | No external auth SDK; Web Crypto + cookies + Prisma |
| Server-first security | Mutations and session creation happen in server actions |
| Admin-only (today) | All protected routes live under `/admin` |
| Stateless sessions | Session payload is signed; no session table in the DB |
| Email-driven recovery | Password reset via one-time tokens + SMTP templates |

### Non-goals (current scope)

- **No roles or permissions** — any authenticated user can access all admin routes.
- **No storefront customer auth** — public shop pages are unauthenticated. A future “my account” area is planned separately (see [Roadmap](#roadmap)).
- **No OAuth / social login**.
- **No refresh tokens** — sessions expire after a fixed TTL; users sign in again.

### Why custom sessions instead of Auth.js?

- Full control over cookie shape, TTL, and validation without adapter overhead.
- Fits the project pattern: **reads from route handlers / RSC, mutations via server actions**.
- Small surface area: one `User` model, one cookie, one HMAC secret.

Trade-off: we own rotation, revocation, and future RBAC ourselves.

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Auth pages / Admin UI]
  end

  subgraph server [Next.js Server]
    SA[Server actions<br/>login · register · logout · reset]
    MW[Middleware<br/>src/proxy.ts]
    SESS[Session helpers<br/>src/lib/auth/session.ts]
    TOK[Token codec<br/>src/lib/auth/session-token.ts]
    PW[Password<br/>scrypt hash/verify]
  end

  subgraph data [Persistence]
    PG[(Postgres via Prisma)]
  end

  UI -->|form submit| SA
  SA --> PW
  SA --> SESS
  SESS --> TOK
  SESS -->|Set-Cookie admin_session| UI
  MW -->|read cookie| TOK
  MW -->|redirect if unauthenticated| UI
  SA --> PG
  SESS -->|load user by id| PG
```

### Request flow (protected admin route)

1. Browser sends request with `admin_session` cookie.
2. Middleware (`src/proxy.ts`) parses and verifies the token signature + expiry.
3. If invalid and path is not public → redirect to `/admin/login?next=<path>`.
4. If valid → request proceeds; dashboard layout calls `getSession()` to load user details for the UI.

### Login flow

1. Client validates input with `loginSchema` (Zod).
2. `loginAction` looks up user by normalized email, verifies password with scrypt.
3. On success, `createSession(userId)` sets the signed cookie and redirects to `/admin` (or `next` if safe).
4. On failure, returns `{ success: false, error }` without revealing whether the email exists.

---

## Session model

### Cookie

| Property | Value |
|----------|-------|
| Name | `admin_session` (`SESSION_COOKIE_NAME`) |
| Format | `<base64url-payload>.<base64url-hmac-sha256-signature>` |
| Payload | `{ userId: string, exp: number }` (Unix seconds) |
| Max age | 7 days |
| Flags | `httpOnly`, `sameSite: lax`, `secure` in production, `path: /` |

Signing uses `AUTH_SECRET` via Web Crypto HMAC-SHA256. Signature comparison is timing-safe.

Implementation:

- Encode / verify: `src/lib/auth/session-token.ts`
- Set / read / destroy: `src/lib/auth/session.ts`

### Server-side session lookup

`getSession()` verifies the cookie, then **loads the user from the database** by `userId`. This means:

- Deleted users lose access on the next request (payload still valid until expiry, but DB lookup returns null).
- Email/name changes in DB are reflected immediately in the UI.
- There is no server-side session revocation list; invalidating access for a live session requires changing `AUTH_SECRET` (logs everyone out) or waiting for expiry.

---

## Passwords

| Concern | Implementation |
|---------|----------------|
| Hashing | Node `scrypt` with random 16-byte salt |
| Storage format | `{salt}:{hash}` (hex) in `User.password` |
| Minimum length | 8 characters (register + reset) |
| Verification | Timing-safe compare of derived hash |

See `src/lib/password.ts`.

---

## Route protection

### Public admin paths

These do **not** require a session:

- `/admin/login`
- `/admin/register`
- `/admin/reset-password` (and `/admin/reset-password/[token]`)

Authenticated users hitting login or register are redirected to `/admin`.

### Protected paths

Everything else under `/admin/*` requires a valid session cookie.

Logic lives in `src/proxy.ts`. It must be wired as Next.js middleware:

```ts
// src/middleware.ts (required for enforcement)
export { proxy as middleware, config } from "./proxy";
```

> **Note:** Without `src/middleware.ts`, route protection is not active at the edge. Server actions still enforce auth only where explicitly checked — add middleware before production.

### Post-login redirect

Login accepts an optional `next` query param. Only paths that start with `/admin` and are not login/register are honored; otherwise redirect defaults to `/admin`.

---

## Server actions

All auth mutations are `"use server"` actions under `src/actions/auth/`.

| Action | File | Behavior |
|--------|------|----------|
| `loginAction` | `login.ts` | Validate → verify password → `createSession` → redirect |
| `registerAction` | `register.ts` | Validate → create user → session → welcome email → redirect |
| `logoutAction` | `logout.ts` | `destroySession` → redirect to login |
| `requestPasswordResetAction` | `request-password-reset.ts` | Always returns success message (no email enumeration) |
| `resetPasswordAction` | `reset-password.ts` | Validate token → update password → delete tokens → redirect |
| `getPasswordResetToken` | `reset-password.ts` | Server helper to validate token before showing reset form |

Admin user management (`createUser` in `src/actions/users/create-user.ts`) creates users with hashed passwords but does **not** sign them in.

### Validation schemas

Shared Zod schemas in `src/lib/auth/schemas.ts`:

- `loginSchema` — email + password
- `registerSchema` — optional name, email, password, confirmPassword
- `requestPasswordResetSchema` — email
- `resetPasswordSchema` — password + confirmPassword

Client forms use the same schemas via `react-hook-form` + `@hookform/resolvers/zod`.

---

## Database

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  ...
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  ...
}
```

Reset tokens:

- 32-byte random hex string
- TTL: **1 hour** (`RESET_TOKEN_TTL_MS`)
- Previous tokens for the same user are deleted when a new reset is requested
- All tokens for the user are deleted after a successful reset

---

## Email

| Event | Template | Trigger |
|-------|----------|---------|
| Registration | `welcome` | `registerAction` |
| Password reset | `reset-password` | `requestPasswordResetAction` |

Templates live under `src/lib/email/`. If SMTP is not configured, the reset link is logged to the console in development.

Reset URL shape: `{APP_BASE_URL}/admin/reset-password/{token}`

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AUTH_SECRET` | Yes | HMAC key for session signing. Use a long random string (≥ 32 chars). |
| `DATABASE_URL` | Yes | Postgres connection for users and reset tokens |
| SMTP / `NEXT_PUBLIC_SERVER_URL` | For emails | Welcome and reset emails; base URL for links |

Generate a secret:

```bash
openssl rand -base64 32
```

---

## UI structure

```
src/app/admin/
├── (auth)/                    # Unauthenticated layout
│   ├── login/
│   ├── register/
│   └── reset-password/
│       └── [token]/
└── (dashboard)/               # Authenticated layout (sidebar, getSession)
    └── ...
```

Shared auth chrome: `src/components/admin/auth-shell.tsx`.

Logout: `logoutAction` from the user menu in `src/components/nav-user.tsx`.

---

## Security considerations

### Implemented

- Passwords hashed with scrypt, never stored in plain text
- Session cookie is `httpOnly` (not readable by JS)
- HMAC prevents tampering with `userId` / `exp`
- Timing-safe signature and password comparison
- Generic error on login failure (“Invalid email or password”)
- Password reset response does not reveal whether an email is registered
- Reset tokens are single-use and time-limited

### Gaps / follow-ups

| Item | Recommendation |
|------|----------------|
| Middleware not wired | Add `src/middleware.ts` exporting `proxy` |
| No RBAC | Add `role` on `User` and check in middleware or layout when needed |
| No rate limiting | Add rate limits on login and reset endpoints (e.g. Upstash or edge counter) |
| No session revocation | Optional `sessionVersion` on user, include in payload, bump on password change |
| Open registration | Consider disabling `/admin/register` in production or gating behind invite |
| CSRF | Server actions use Next.js built-in origin check; keep mutations as POST actions only |

---

## Roadmap

From project tasks — not yet implemented:

1. **Storefront “my account”** — orders, profile, separate from admin auth (may share `User` or use a distinct customer model).
2. **Auth UI polish** — styling pass on login/register/reset pages.
3. **Admin-controlled auth emails** — editable templates from settings.

When adding customer auth, prefer:

- Separate cookie name or namespace (e.g. `customer_session` vs `admin_session`)
- Separate route group (e.g. `/account/*`) and middleware matcher
- Optional shared password utilities in `src/lib/password.ts`

---

## File reference

| Path | Responsibility |
|------|----------------|
| `src/lib/auth/session.ts` | Create, read, destroy session cookie |
| `src/lib/auth/session-token.ts` | Sign / parse session token |
| `src/lib/auth/schemas.ts` | Zod validation |
| `src/lib/password.ts` | scrypt hash and verify |
| `src/proxy.ts` | Admin route guard (middleware) |
| `src/actions/auth/*` | Auth server actions |
| `src/constants/index.ts` | `SESSION_COOKIE_NAME`, `RESET_TOKEN_TTL_MS` |
| `prisma/schema.prisma` | `User`, `PasswordResetToken` |

---

## Quick checklist for new auth-related work

1. Add or extend a Zod schema in `src/lib/auth/schemas.ts`.
2. Implement logic as a server action in `src/actions/auth/` (or domain-specific action with `getSession()` guard).
3. If the route is new and sensitive, update `PUBLIC_ADMIN_PATHS` in `src/proxy.ts` only if it should be public.
4. For password changes, always use `hashPassword` / `verifyPassword`.
5. Never expose `AUTH_SECRET` or password hashes to the client.
6. Use `getSession()` in server components/actions when you need the current user — do not trust client-provided user IDs.
