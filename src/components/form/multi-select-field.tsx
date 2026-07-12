"use client";

import { useMemo, useState } from "react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";
import ReactSelect, {
  type ClassNamesConfig,
  type MultiValue,
} from "react-select";

import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";
import { resolveFieldRequired } from "./utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const DEFAULT_MAX_MENU_HEIGHT = 200;

const multiSelectClassNames: ClassNamesConfig<MultiSelectOption, true> = {
  control: ({ isFocused, isDisabled }) =>
    cn(
      "flex min-h-9 w-full items-center rounded-md border border-input bg-transparent px-1 text-sm shadow-xs transition-[color,box-shadow]",
      isFocused && "border-ring ring-[3px] ring-ring/50",
      isDisabled && "cursor-not-allowed opacity-50"
    ),
  placeholder: () => "text-muted-foreground",
  menu: () =>
    cn(
      "relative z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
    ),
  menuList: () => "p-1",
  option: ({ isFocused, isSelected, isDisabled }) =>
    cn(
      "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
      isFocused && "bg-accent text-accent-foreground",
      isSelected && "bg-primary text-primary-foreground",
      isDisabled && "pointer-events-none opacity-50"
    ),
  multiValue: () => "mr-1 rounded bg-secondary text-secondary-foreground",
  multiValueLabel: () => "px-1.5 py-0.5 text-xs",
  multiValueRemove: () =>
    "rounded-r px-1 hover:bg-destructive hover:text-destructive-foreground",
  valueContainer: () => "gap-1 px-2",
  input: () => "text-sm",
  indicatorsContainer: () => "gap-1",
  dropdownIndicator: () => "px-1 text-muted-foreground",
  clearIndicator: () => "px-1 text-muted-foreground",
  noOptionsMessage: () => "px-2 py-1.5 text-sm text-muted-foreground",
};

type MultiSelectFieldInnerProps = FieldCommonProps & {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  maxMenuHeight?: number;
  name?: string;
};

function MultiSelectFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled,
  placeholder = "Select...",
  emptyMessage = "None available.",
  maxMenuHeight = DEFAULT_MAX_MENU_HEIGHT,
  name,
}: MultiSelectFieldInnerProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selectedValues = isControlled ? value : internalValue;

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues]
  );

  function handleChange(nextValue: MultiValue<MultiSelectOption>) {
    const nextIds = nextValue.map((option) => option.value);

    if (!isControlled) {
      setInternalValue(nextIds);
    }

    onChange?.(nextIds);
  }

  return (
    <FieldBase
      id={idProp}
      label={label}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      {(controlProps) =>
        options.length === 0 ? (
          <p className="rounded-md border p-3 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ReactSelect
            inputId={controlProps.id}
            name={name ?? controlProps.id}
            instanceId={controlProps.id}
            isMulti
            isClearable
            isSearchable
            isDisabled={disabled}
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            noOptionsMessage={() => "No matches found."}
            maxMenuHeight={maxMenuHeight}
            aria-invalid={controlProps["aria-invalid"]}
            aria-describedby={controlProps["aria-describedby"]}
            aria-required={controlProps["aria-required"]}
            classNames={{
              ...multiSelectClassNames,
              control: (state) =>
                cn(
                  multiSelectClassNames.control?.(state),
                  error && "border-destructive"
                ),
            }}
            unstyled
          />
        )
      }
    </FieldBase>
  );
}

export type MultiSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
  MultiSelectFieldInnerProps,
  "value" | "defaultValue" | "onChange" | "onBlur"
> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
  };

export function MultiSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  error,
  required,
  onChange,
  ...props
}: MultiSelectFieldProps<TFieldValues, TName>) {
  const isRequired = resolveFieldRequired(required, rules);

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <MultiSelectFieldInner
            {...props}
            required={isRequired}
            name={field.name}
            value={field.value ?? []}
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
    <MultiSelectFieldInner
      {...props}
      required={isRequired}
      name={name}
      error={error}
      onChange={onChange}
    />
  );
}
