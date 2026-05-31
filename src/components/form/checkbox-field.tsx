"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";

type CheckboxFieldInnerProps = FieldCommonProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
};

function CheckboxFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  checked,
  defaultChecked,
  disabled,
  name,
  onCheckedChange,
  onBlur,
}: CheckboxFieldInnerProps) {
  const id = idProp ?? name ?? "checkbox";
  const descriptionId = helpText ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const isControlled = checked !== undefined;

  return (
    <Field
      orientation="horizontal"
      className={cn(className)}
      data-invalid={!!error}
    >
      <Checkbox
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        className={cn(error && "border-destructive", inputClassName)}
        {...(isControlled
          ? { checked, onCheckedChange }
          : { defaultChecked, onCheckedChange })}
        onBlur={onBlur}
      />

      <FieldContent>
        {label ? (
          <FieldLabel htmlFor={id}>
            {label}
            {required ? (
              <span aria-hidden="true" className="text-destructive">
                {" "}
                *
              </span>
            ) : null}
          </FieldLabel>
        ) : null}

        {helpText ? (
          <FieldDescription id={descriptionId}>{helpText}</FieldDescription>
        ) : null}

        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}

export type CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<CheckboxFieldInnerProps, "onCheckedChange" | "onBlur"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    onCheckedChange?: (checked: boolean) => void;
  };

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  onCheckedChange,
  ...props
}: CheckboxFieldProps<TFieldValues, TName>) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <CheckboxFieldInner
            {...props}
            name={field.name}
            checked={!!field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              onCheckedChange?.(checked);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <CheckboxFieldInner
      {...props}
      name={name}
      error={error}
      onCheckedChange={onCheckedChange}
    />
  );
}
