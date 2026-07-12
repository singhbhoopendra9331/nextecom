"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import Editor from "@/components/editor";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";
import { resolveFieldRequired } from "./utils";

type RichtextFieldInnerProps = FieldCommonProps & {
  value?: unknown;
  defaultValue?: unknown;
  editorKey?: string;
  disabled?: boolean;
  name?: string;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
};

function RichtextFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  value,
  defaultValue,
  editorKey,
  disabled,
  name,
  onChange,
  onBlur,
}: RichtextFieldInnerProps) {
  const isControlled = value !== undefined;
  const initialContent = isControlled ? value : defaultValue;
  const remountKey = editorKey ?? name ?? idProp ?? "richtext";

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
        <div
          id={controlProps.id}
          aria-invalid={controlProps["aria-invalid"]}
          aria-describedby={controlProps["aria-describedby"]}
          aria-required={controlProps["aria-required"]}
          data-name={name ?? controlProps.id}
          className={cn(
            disabled && "pointer-events-none opacity-50",
            error && "[&_.bn-editor]:border-destructive",
            inputClassName
          )}
          onBlur={onBlur}
        >
          <Editor
            key={remountKey}
            initialContent={initialContent}
            onChange={(nextValue) => {
              onChange?.(nextValue);
            }}
          />
        </div>
      )}
    </FieldBase>
  );
}

export type RichtextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<RichtextFieldInnerProps, "onChange" | "onBlur"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    onChange?: (value: unknown) => void;
  };

export function RichtextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  required,
  editorKey,
  onChange,
  ...props
}: RichtextFieldProps<TFieldValues, TName>) {
  const isRequired = resolveFieldRequired(required, rules);

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <RichtextFieldInner
            {...props}
            required={isRequired}
            name={field.name}
            editorKey={editorKey ?? field.name}
            value={field.value}
            onChange={(nextValue) => {
              field.onChange(nextValue);
              onChange?.(nextValue);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <RichtextFieldInner
      {...props}
      required={isRequired}
      name={name}
      editorKey={editorKey ?? name}
      error={error}
      onChange={onChange}
    />
  );
}
