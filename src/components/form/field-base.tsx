"use client";

import { useId, type ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { RequiredMark } from "./required-mark";
import type { FieldCommonProps, FieldControlProps } from "./types";

type FieldBaseProps = FieldCommonProps & {
  children: (controlProps: FieldControlProps) => React.ReactNode;
};

export function FieldLabelContent({
  label,
  required,
}: {
  label: ReactNode;
  required?: boolean;
}) {
  return (
    <>
      {label}
      {required ? <RequiredMark /> : null}
    </>
  );
}

export function FieldBase({
  id: idProp,
  label,
  helpText,
  error,
  required,
  className,
  children,
}: FieldBaseProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = helpText ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Field className={cn(className)} data-invalid={!!error}>
      {label ? (
        <FieldLabel htmlFor={id}>
          <FieldLabelContent label={label} required={required} />
        </FieldLabel>
      ) : null}

      <FieldContent>
        {children({
          id,
          "aria-invalid": !!error || undefined,
          "aria-describedby": describedBy,
          "aria-required": required || undefined,
        })}

        {helpText ? (
          <FieldDescription id={descriptionId}>{helpText}</FieldDescription>
        ) : null}

        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}
