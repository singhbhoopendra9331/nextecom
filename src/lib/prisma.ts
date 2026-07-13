import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Use DATABASE_URL; if the value wrongly starts with "DATABASE_URL=", strip it. */
function getConnectionString(): string {
  const raw = getEnv("DATABASE_URL");
  if (raw.startsWith("DATABASE_URL=")) {
    const match = raw.match(/^DATABASE_URL=(.+)$/);
    return (match?.[1] ?? raw).replace(/^["']|["']$/g, "").trim();
  }
  return raw.trim();
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

function userModelHasField(client: PrismaClient, field: string): boolean {
  const runtimeDataModel = (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: { name: string; type?: string }[] }>;
      };
    }
  )._runtimeDataModel;

  const fields = runtimeDataModel?.models?.User?.fields ?? [];
  return fields.some((item) => item.name === field);
}

function productModelFieldType(
  client: PrismaClient,
  model: string,
  field: string
): string | undefined {
  const runtimeDataModel = (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: { name: string; type?: string }[] }>;
      };
    }
  )._runtimeDataModel;

  return runtimeDataModel?.models?.[model]?.fields?.find(
    (item) => item.name === field
  )?.type;
}

function productTaxonomiesUseSharedModels(client: PrismaClient): boolean {
  return (
    productModelFieldType(client, "Product", "categories") === "Category" &&
    productModelFieldType(client, "Product", "tags") === "Tag"
  );
}

function isValidClient(client: PrismaClient | undefined): boolean {
  return Boolean(
    client &&
      typeof (client as unknown as Record<string, unknown>).applicationLog ===
        "object" &&
      userModelHasField(client, "sessionVersion") &&
      userModelHasField(client, "role") &&
      productTaxonomiesUseSharedModels(client)
  );
}

function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;

  if (existing && isValidClient(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;

  return client;
}

/** Lazy singleton: created on first use (e.g. prisma.post) so Next.js API routes get a valid client. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});
