"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { setOption } from "@/lib/options";
import {
  parseOptionValue,
  type OptionValueType,
} from "@/lib/settings/option-value";

function normalizeOptionValue(
  valueType: OptionValueType,
  value: unknown
): Prisma.InputJsonValue {
  return parseOptionValue(valueType, value) as Prisma.InputJsonValue;
}

export async function createOption(data: {
  key: string;
  valueType: OptionValueType;
  value: unknown;
  autoload: boolean;
}) {
  try {
    const key = data.key.trim();

    if (!key) {
      throw new Error("Key is required");
    }

    const existing = await prisma.option.findUnique({ where: { key } });

    if (existing) {
      throw new Error("An option with this key already exists");
    }

    const parsedValue = normalizeOptionValue(data.valueType, data.value);

    await setOption(key, parsedValue, data.autoload);

    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("createOption", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create option",
    };
  }
}

export async function updateOption(data: {
  key: string;
  valueType: OptionValueType;
  value: unknown;
  autoload: boolean;
}) {
  try {
    const key = data.key.trim();

    if (!key) {
      throw new Error("Key is required");
    }

    const existing = await prisma.option.findUnique({ where: { key } });

    if (!existing) {
      throw new Error("Option not found");
    }

    const parsedValue = normalizeOptionValue(data.valueType, data.value);

    await setOption(key, parsedValue, data.autoload);

    revalidatePath("/admin/settings");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("updateOption", error);

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update option",
    };
  }
}
