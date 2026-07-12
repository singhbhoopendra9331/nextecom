"use client";

import * as React from "react";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectOptionGroup = {
  label?: string;
  options: SelectOption[];
};

type AppSelectProps = {
  id?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  name?: string;
  size?: "sm" | "default";
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

export function AppSelect({
  id: idProp,
  placeholder,
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  label,
  disabled,
  className,
  triggerClassName,
  name,
  size = "default",
}: AppSelectProps) {
  const generatedId = useId();
  const fieldId = idProp ?? name ?? generatedId;
  const fieldName = name ?? fieldId;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleValueChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const selectProps = isControlled
    ? { value: selectedValue || undefined }
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
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}

      <Select
        {...selectProps}
        onValueChange={handleValueChange}
        disabled={disabled}
        name={fieldName}
      >
        <SelectTrigger
          id={fieldId}
          className={cn("w-full", triggerClassName)}
          size={size}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{content}</SelectContent>
      </Select>
    </div>
  );
}
