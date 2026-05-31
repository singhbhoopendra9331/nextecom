"use client";

import { useId } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import type { FieldCommonProps, FieldControlProps } from "./types";

type FieldBaseProps = FieldCommonProps & {
  children: (controlProps: FieldControlProps) => React.ReactNode;
};

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
          {label}
          {required ? (
            <span aria-hidden="true" className="text-destructive">
              {" "}
              *
            </span>
          ) : null}
        </FieldLabel>
      ) : null}

      <FieldContent>
        {children({
          id,
          "aria-invalid": !!error || undefined,
          "aria-describedby": describedBy,
        })}

        {helpText ? (
          <FieldDescription id={descriptionId}>{helpText}</FieldDescription>
        ) : null}

        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}
