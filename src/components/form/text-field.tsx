"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";
import { resolveFieldRequired } from "./utils";

type TextFieldInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue"
>;

export type TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = TextFieldInputProps &
  FieldCommonProps &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    type?: React.HTMLInputTypeAttribute;
    value?: string;
    defaultValue?: string;
  };

type TextFieldInnerProps = TextFieldInputProps &
  FieldCommonProps & {
    type?: React.HTMLInputTypeAttribute;
    value?: string;
    defaultValue?: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    ref?: React.Ref<HTMLInputElement>;
  };

export function TextFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  type = "text",
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  className: nativeClassName,
  ...inputProps
}: TextFieldInnerProps) {
  const isControlled = value !== undefined;

  return (
    <FieldBase
      id={idProp}
      label={label}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      {(controlProps) => (
        <Input
          {...controlProps}
          {...inputProps}
          ref={ref}
          type={type}
          name={name ?? controlProps.id}
          disabled={disabled}
          required={required}
          className={cn(
            error && "border-destructive",
            inputClassName,
            nativeClassName
          )}
          {...(isControlled
            ? { value, onChange, onBlur }
            : { defaultValue, onChange, onBlur })}
        />
      )}
    </FieldBase>
  );
}

export function TextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  required,
  ...props
}: TextFieldProps<TFieldValues, TName>) {
  const isRequired = resolveFieldRequired(required, rules);

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <TextFieldInner
            {...props}
            required={isRequired}
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

  return (
    <TextFieldInner
      {...props}
      required={isRequired}
      name={name}
      error={error}
    />
  );
}
