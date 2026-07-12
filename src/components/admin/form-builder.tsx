"use client";

import { Plus, Trash2 } from "lucide-react";
import slugify from "slugify";

import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createEmptyField } from "@/lib/forms/defaults";
import { FORM_FIELD_TYPES, type FormFieldDefinition } from "@/types/forms";

const FIELD_TYPE_OPTIONS = FORM_FIELD_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

type FormBuilderProps = {
  fields: FormFieldDefinition[];
  onChange: (fields: FormFieldDefinition[]) => void;
};

function updateField(
  fields: FormFieldDefinition[],
  id: string,
  patch: Partial<FormFieldDefinition>
) {
  return fields.map((field) => (field.id === id ? { ...field, ...patch } : field));
}

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  function addField() {
    onChange([...fields, createEmptyField()]);
  }

  function removeField(id: string) {
    onChange(fields.filter((field) => field.id !== id));
  }

  function updateFieldOptions(
    field: FormFieldDefinition,
    optionIndex: number,
    patch: { label?: string; value?: string }
  ) {
    const options = [...(field.options ?? [])];
    options[optionIndex] = { ...options[optionIndex], ...patch };
    onChange(updateField(fields, field.id, { options }));
  }

  function addOption(field: FormFieldDefinition) {
    const options = [...(field.options ?? []), { label: "", value: "" }];
    onChange(updateField(fields, field.id, { options }));
  }

  function removeOption(field: FormFieldDefinition, optionIndex: number) {
    const options = (field.options ?? []).filter((_, index) => index !== optionIndex);
    onChange(updateField(fields, field.id, { options }));
  }

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No fields yet. Add your first field.
        </div>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Field {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove field</span>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`field-label-${field.id}`}>Label</Label>
                <Input
                  id={`field-label-${field.id}`}
                  value={field.label}
                  onChange={(event) => {
                    const label = event.target.value;
                    const patch: Partial<FormFieldDefinition> = { label };

                    if (!field.name.trim()) {
                      patch.name = slugify(label, {
                        lower: true,
                        strict: true,
                        replacement: "_",
                      });
                    }

                    onChange(updateField(fields, field.id, patch));
                  }}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`field-name-${field.id}`}>Name</Label>
                <Input
                  id={`field-name-${field.id}`}
                  value={field.name}
                  onChange={(event) =>
                    onChange(
                      updateField(fields, field.id, {
                        name: slugify(event.target.value, {
                          lower: true,
                          strict: true,
                          replacement: "_",
                        }),
                      })
                    )
                  }
                  placeholder="full_name"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AppSelect
                label="Type"
                name={`fields.${index}.type`}
                value={field.type}
                onValueChange={(value) =>
                  onChange(
                    updateField(fields, field.id, {
                      type: value as FormFieldDefinition["type"],
                    })
                  )
                }
                options={FIELD_TYPE_OPTIONS}
              />

              <div className="space-y-2">
                <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`field-placeholder-${field.id}`}
                  value={field.placeholder ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateField(fields, field.id, {
                        placeholder: event.target.value,
                      })
                    )
                  }
                  placeholder="Optional placeholder"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id={`field-required-${field.id}`}
                checked={Boolean(field.required)}
                onCheckedChange={(checked) =>
                  onChange(updateField(fields, field.id, { required: checked }))
                }
              />
              <Label htmlFor={`field-required-${field.id}`}>Required</Label>
            </div>

            {field.type === "select" ? (
              <div className="space-y-2">
                <Label>Options</Label>
                {(field.options ?? []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      id={`field-option-label-${field.id}-${optionIndex}`}
                      value={option.label}
                      onChange={(event) =>
                        updateFieldOptions(field, optionIndex, {
                          label: event.target.value,
                          value:
                            option.value ||
                            slugify(event.target.value, {
                              lower: true,
                              strict: true,
                            }),
                        })
                      }
                      placeholder="Label"
                    />
                    <Input
                      id={`field-option-value-${field.id}-${optionIndex}`}
                      value={option.value}
                      onChange={(event) =>
                        updateFieldOptions(field, optionIndex, {
                          value: event.target.value,
                        })
                      }
                      placeholder="Value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(field, optionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addOption(field)}>
                  Add Option
                </Button>
              </div>
            ) : null}
          </div>
        ))
      )}

      <Button type="button" variant="outline" onClick={addField}>
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
