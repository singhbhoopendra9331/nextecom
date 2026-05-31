"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import {
  MediaPicker,
  type MediaPickerValue,
} from "@/components/media-picker";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";

export type UploadFieldValue = MediaPickerValue | null;

type UploadFieldInnerProps = FieldCommonProps & {
  value?: UploadFieldValue;
  defaultValue?: UploadFieldValue;
  disabled?: boolean;
  name?: string;
  onChange?: (value: UploadFieldValue) => void;
  onBlur?: () => void;
};

function UploadFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  onBlur,
}: UploadFieldInnerProps) {
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : defaultValue;

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
          data-name={name}
          className={cn(
            disabled && "pointer-events-none opacity-50",
            error && "[&>div>div]:border-destructive",
            inputClassName
          )}
          onBlur={onBlur}
        >
          <MediaPicker
            value={selectedValue}
            onChange={(media) => {
              onChange?.(media);
            }}
          />
        </div>
      )}
    </FieldBase>
  );
}

export type UploadFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<UploadFieldInnerProps, "onChange" | "onBlur"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    onChange?: (value: UploadFieldValue) => void;
  };

export function UploadField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  onChange,
  ...props
}: UploadFieldProps<TFieldValues, TName>) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <UploadFieldInner
            {...props}
            name={field.name}
            value={field.value ?? null}
            onChange={(media) => {
              field.onChange(media);
              onChange?.(media);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <UploadFieldInner
      {...props}
      name={name}
      error={error}
      onChange={onChange}
    />
  );
}
