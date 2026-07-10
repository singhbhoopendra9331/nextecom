#!/usr/bin/env bash
# Copy all data from local Postgres to remote (Supabase) Postgres.
# Schema must already exist on remote — runs `prisma migrate deploy` first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOCAL_URL="${LOCAL_DATABASE_URL:-postgresql://postgres:admin@localhost:5432/nextecom}"
ENV_FILE="${REMOTE_ENV_FILE:-.env.prod}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE (set REMOTE_ENV_FILE to override)" >&2
  exit 1
fi

REMOTE_URL="$(node -e "
  require('dotenv').config({ path: process.argv[1] });
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) { console.error('DIRECT_URL or DATABASE_URL not set in env file'); process.exit(1); }
  process.stdout.write(url);
" "$ENV_FILE")"

DUMP_FILE="$(mktemp "${TMPDIR:-/tmp}/nextecom-local-dump.XXXXXX.sql")"
cleanup() { rm -f "$DUMP_FILE"; }
trap cleanup EXIT

echo "→ Ensuring remote schema is up to date..."
DIRECT_URL="$REMOTE_URL" DATABASE_URL="$REMOTE_URL" npx prisma migrate deploy

echo "→ Dumping local data..."
pg_dump "$LOCAL_URL" --data-only --no-owner --no-acl -f "$DUMP_FILE"

echo "→ Clearing remote data (keeping _prisma_migrations)..."
psql "$REMOTE_URL" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  ) LOOP
    EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', r.tablename);
  END LOOP;
END $$;
SQL

echo "→ Restoring local data to remote..."
psql "$REMOTE_URL" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"

echo "✓ Local database data synced to remote."
