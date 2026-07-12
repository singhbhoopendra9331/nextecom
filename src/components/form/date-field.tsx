"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { FieldBase } from "./field-base";
import type { FieldCommonProps, ReactHookFormFieldProps } from "./types";
import { resolveFieldRequired } from "./utils";

type DateFieldInnerProps = FieldCommonProps & {
  value?: Date;
  defaultValue?: Date;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
  calendarDisabled?: React.ComponentProps<typeof Calendar>["disabled"];
  name?: string;
  onChange?: (value: Date | undefined) => void;
  onBlur?: () => void;
};

function DateFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  value,
  defaultValue,
  placeholder = "Pick a date",
  disabled,
  dateFormat = "PPP",
  calendarDisabled,
  onChange,
  onBlur,
}: DateFieldInnerProps) {
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : defaultValue;

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
        <Popover
          onOpenChange={(open) => {
            if (!open) {
              onBlur?.();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              id={controlProps.id}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={controlProps["aria-invalid"]}
              aria-describedby={controlProps["aria-describedby"]}
              aria-required={controlProps["aria-required"]}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                error && "border-destructive",
                inputClassName
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {selectedDate ? format(selectedDate, dateFormat) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              disabled={calendarDisabled}
              onSelect={(date) => {
                onChange?.(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </FieldBase>
  );
}

export type DateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<DateFieldInnerProps, "onChange" | "onBlur"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    onChange?: (value: Date | undefined) => void;
  };

export function DateField<
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
}: DateFieldProps<TFieldValues, TName>) {
  const isRequired = resolveFieldRequired(required, rules);

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <DateFieldInner
            {...props}
            required={isRequired}
            value={field.value}
            onChange={(date) => {
              field.onChange(date);
              onChange?.(date);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <DateFieldInner
      {...props}
      required={isRequired}
      error={error}
      onChange={onChange}
    />
  );
}
