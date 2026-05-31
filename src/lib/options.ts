import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getOption<T = unknown>(
  key: string,
  defaultValue?: T
): Promise<T | undefined> {
  const option = await prisma.option.findUnique({
    where: { key },
  });

  if (!option) {
    return defaultValue;
  }

  return option.value as T;
}

export async function setOption(
  key: string,
  value: Prisma.InputJsonValue,
  autoload = true
) {
  return prisma.option.upsert({
    where: { key },
    create: { key, value, autoload },
    update: { value, autoload },
  });
}

export async function deleteOption(key: string) {
  try {
    await prisma.option.delete({ where: { key } });
    return true;
  } catch {
    return false;
  }
}

export async function getAutoloadOptions(): Promise<Record<string, unknown>> {
  const options = await prisma.option.findMany({
    where: { autoload: true },
    select: { key: true, value: true },
  });

  return Object.fromEntries(options.map((option) => [option.key, option.value]));
}

export async function getAllOptions() {
  return prisma.option.findMany({
    orderBy: { key: "asc" },
  });
}
