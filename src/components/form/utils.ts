import type { FieldPath, FieldValues, RegisterOptions } from "react-hook-form";

export function resolveFieldRequired<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(required?: boolean, rules?: RegisterOptions<TFieldValues, TName>) {
  if (required !== undefined) {
    return required;
  }

  if (rules?.required === undefined) {
    return false;
  }

  if (typeof rules.required === "boolean") {
    return rules.required;
  }

  if (
    typeof rules.required === "object" &&
    rules.required !== null &&
    "value" in rules.required
  ) {
    return Boolean(rules.required.value);
  }

  return true;
}
