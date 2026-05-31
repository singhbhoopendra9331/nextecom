"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { TextFieldInner } from "./text-field";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";

type EmailFieldInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue"
>;

export type EmailFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = EmailFieldInputProps &
  FieldCommonProps &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    value?: string;
    defaultValue?: string;
  };

type EmailFieldInnerProps = EmailFieldInputProps &
  FieldCommonProps & {
    value?: string;
    defaultValue?: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    ref?: React.Ref<HTMLInputElement>;
  };

function EmailFieldInner(props: EmailFieldInnerProps) {
  return (
    <TextFieldInner
      {...props}
      type="email"
      autoComplete="email"
      inputMode="email"
    />
  );
}

export function EmailField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  ...props
}: EmailFieldProps<TFieldValues, TName>) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <EmailFieldInner
            {...props}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return <EmailFieldInner {...props} name={name} error={error} />;
}
