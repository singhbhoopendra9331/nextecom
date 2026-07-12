"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";
import type { DateRange } from "react-day-picker";

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

export type { DateRange };

type DateRangeFieldInnerProps = FieldCommonProps & {
  value?: DateRange;
  defaultValue?: DateRange;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
  calendarDisabled?: React.ComponentProps<typeof Calendar>["disabled"];
  numberOfMonths?: number;
  name?: string;
  onChange?: (value: DateRange | undefined) => void;
  onBlur?: () => void;
};

function formatDateRange(
  range: DateRange | undefined,
  dateFormat: string,
  placeholder: string
) {
  if (!range?.from) {
    return placeholder;
  }

  if (range.to) {
    return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
  }

  return format(range.from, dateFormat);
}

function DateRangeFieldInner({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  inputClassName,
  value,
  defaultValue,
  placeholder = "Pick a date range",
  disabled,
  dateFormat = "PPP",
  calendarDisabled,
  numberOfMonths = 2,
  onChange,
  onBlur,
}: DateRangeFieldInnerProps) {
  const isControlled = value !== undefined;
  const selectedRange = isControlled ? value : defaultValue;

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
                !selectedRange?.from && "text-muted-foreground",
                error && "border-destructive",
                inputClassName
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {formatDateRange(selectedRange, dateFormat, placeholder)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={selectedRange}
              defaultMonth={selectedRange?.from}
              numberOfMonths={numberOfMonths}
              disabled={calendarDisabled}
              onSelect={(range) => {
                onChange?.(range);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </FieldBase>
  );
}

export type DateRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<DateRangeFieldInnerProps, "onChange" | "onBlur"> &
  ReactHookFormFieldProps<TFieldValues, TName> & {
    onChange?: (value: DateRange | undefined) => void;
  };

export function DateRangeField<
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
}: DateRangeFieldProps<TFieldValues, TName>) {
  const isRequired = resolveFieldRequired(required, rules);

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <DateRangeFieldInner
            {...props}
            required={isRequired}
            value={field.value}
            onChange={(range) => {
              field.onChange(range);
              onChange?.(range);
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    );
  }

  return (
    <DateRangeFieldInner
      {...props}
      required={isRequired}
      error={error}
      onChange={onChange}
    />
  );
}
