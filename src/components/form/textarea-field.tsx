"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";

type TextareaFieldInputProps = Omit<
  React.ComponentProps<"textarea">,
  "value" | "defaultValue"
>;

export type TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = TextareaFieldInputProps &
  FieldCommonProps &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    value?: string;
    defaultValue?: string;
  };

type TextareaFieldInnerProps = TextareaFieldInputProps &
  FieldCommonProps & {
    value?: string;
    defaultValue?: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    ref?: React.Ref<HTMLTextAreaElement>;
  };

function TextareaFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  className: nativeClassName,
  ...textareaProps
}: TextareaFieldInnerProps) {
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
        <Textarea
          {...controlProps}
          {...textareaProps}
          ref={ref}
          name={name}
          disabled={disabled}
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

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  ...props
}: TextareaFieldProps<TFieldValues, TName>) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <TextareaFieldInner
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

  return <TextareaFieldInner {...props} name={name} error={error} />;
}
