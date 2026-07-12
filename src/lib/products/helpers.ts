import { Prisma } from "@/generated/prisma/client";

export function parseOptionalDecimal(
  value: string | number | null | undefined
): Prisma.Decimal | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return null;
  }

  return new Prisma.Decimal(num);
}

export function decimalToString(
  value: Prisma.Decimal | { toString(): string } | null | undefined
): string {
  if (value == null) {
    return "";
  }

  return value.toString();
}
