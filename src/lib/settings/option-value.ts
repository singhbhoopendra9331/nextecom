export type OptionValueType = "string" | "number" | "boolean" | "null" | "json";

export const OPTION_VALUE_TYPES: { value: OptionValueType; label: string }[] = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "null", label: "Null" },
  { value: "json", label: "JSON (object / array)" },
];

export function detectOptionValueType(value: unknown): OptionValueType {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "string") {
    return "string";
  }

  return "json";
}

export function formatOptionValueLabel(type: OptionValueType): string {
  return OPTION_VALUE_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function formatOptionValueForForm(
  value: unknown,
  type: OptionValueType
): string {
  if (type === "null") {
    return "";
  }

  if (type === "boolean") {
    return value === true ? "true" : "false";
  }

  if (type === "number") {
    return value === undefined || value === null ? "0" : String(value);
  }

  if (type === "string") {
    return value === undefined || value === null ? "" : String(value);
  }

  if (value === undefined || value === null) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

export function parseOptionValue(
  type: OptionValueType,
  raw: unknown
): string | number | boolean | null | Record<string, unknown> | unknown[] {
  switch (type) {
    case "null":
      return null;

    case "boolean":
      return raw === true || raw === "true";

    case "number": {
      const parsed = Number(raw);

      if (Number.isNaN(parsed)) {
        throw new Error("Value must be a valid number");
      }

      return parsed;
    }

    case "string":
      return raw === undefined || raw === null ? "" : String(raw);

    case "json": {
      if (typeof raw !== "string") {
        return raw as Record<string, unknown> | unknown[];
      }

      const trimmed = raw.trim();

      if (!trimmed) {
        throw new Error("JSON value is required");
      }

      const parsed: unknown = JSON.parse(trimmed);

      if (parsed === null || typeof parsed !== "object") {
        throw new Error("JSON value must be an object or array");
      }

      return parsed as Record<string, unknown> | unknown[];
    }

    default:
      throw new Error("Unsupported value type");
  }
}

export function formatOptionValuePreview(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.length > 80 ? `${value.slice(0, 80)}…` : value;
  }

  try {
    const str = JSON.stringify(value);
    return str.length > 80 ? `${str.slice(0, 80)}…` : str;
  } catch {
    return String(value);
  }
}
