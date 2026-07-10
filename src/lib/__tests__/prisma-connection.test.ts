import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("database connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to PostgreSQL", async () => {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    expect(result[0]?.ok).toBe(1);
  });
});
