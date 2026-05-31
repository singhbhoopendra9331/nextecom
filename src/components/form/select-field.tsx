"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption, SelectOptionGroup } from "@/components/select";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";

export type { SelectOption, SelectOptionGroup };

type SelectFieldInnerProps = FieldCommonProps & {
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  name?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

function renderOptions(options: SelectOption[]) {
  return options.map((option) => (
    <SelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
    >
      {option.label}
    </SelectItem>
  ));
}

function SelectFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  placeholder,
  options,
  groups,
  value,
  defaultValue,
  disabled,
  size = "default",
  name,
  onValueChange,
  onBlur,
}: SelectFieldInnerProps) {
  const isControlled = value !== undefined;
  const selectProps = isControlled
    ? { value: value || undefined }
    : { defaultValue: defaultValue || undefined };

  const content = groups?.length ? (
    groups.map((group, index) => (
      <SelectGroup key={group.label ?? index}>
        {group.label ? <SelectLabel>{group.label}</SelectLabel> : null}
        {renderOptions(group.options)}
      </SelectGroup>
    ))
  ) : (
    <SelectGroup>{renderOptions(options ?? [])}</SelectGroup>
  );

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
        <Select
          {...selectProps}
          name={name}
          disabled={disabled}
          onValueChange={(nextValue) => {
            onValueChange?.(nextValue);
          }}
          onOpenChange={(open) => {
            if (!open) {
              onBlur?.();
            }
          }}
        >
          <SelectTrigger
            id={controlProps.id}
            aria-invalid={controlProps["aria-invalid"]}
            aria-describedby={controlProps["aria-describedby"]}
            className={cn(
              "w-full",
              error && "border-destructive",
              inputClassName
            )}
            size={size}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{content}</SelectContent>
        </Select>
      )}
    </FieldBase>
  );
}

export type SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<SelectFieldInnerProps, "onValueChange" | "onBlur" | "value"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    value?: string;
    onValueChange?: (value: string) => void;
  };

export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  onValueChange,
  ...props
}: SelectFieldProps<TFieldValues, TName>) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <SelectFieldInner
            {...props}
            name={field.name}
            value={field.value ?? ""}
            onValueChange={(nextValue) => {
              field.onChange(nextValue);
              onValueChange?.(nextValue);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <SelectFieldInner
      {...props}
      name={name}
      error={error}
      onValueChange={onValueChange}
    />
  );
}
