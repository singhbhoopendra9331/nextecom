import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Use DATABASE_URL; if the value wrongly starts with "DATABASE_URL=", strip it. */
function getConnectionString(): string {
  const raw = process.env.DATABASE_URL ?? "";
  if (raw.startsWith("DATABASE_URL=")) {
    const match = raw.match(/^DATABASE_URL=(.+)$/);
    return (match?.[1] ?? raw).replace(/^["']|["']$/g, "").trim();
  }
  return raw.trim();
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = getConnectionString();
  const adapter = new PrismaPg({
    connectionString,
  });
  const client = new PrismaClient({
    adapter,
    log: ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

/** Lazy singleton: created on first use (e.g. prisma.post) so Next.js API routes get a valid client. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});