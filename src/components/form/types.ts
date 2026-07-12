import type { ReactNode } from "react";
import type {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";

export type FieldCommonProps = {
  id?: string;
  label?: ReactNode;
  helpText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  inputClassName?: string;
};

export type ReactHookFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name?: TName;
  control?: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, TName>;
};

export type FieldControlProps = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};
