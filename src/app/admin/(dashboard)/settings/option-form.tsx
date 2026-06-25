"use client";

import { useEffect, useState } from "react";

import {
  createOption,
  updateOption,
} from "@/actions/settings/upsert-option";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  detectOptionValueType,
  formatOptionValueForForm,
  OPTION_VALUE_TYPES,
  parseOptionValue,
  type OptionValueType,
} from "@/lib/settings/option-value";
import { toast } from "@/lib/toast";

import GlobalSettingsForm from "./global-settings-form";
import SmtpSettingsForm from "./smtp-settings-form";
import { GlobalSettings, SmtpSettings } from "@/types/settings";
import { GLOBAL_SETTINGS_KEY, SMTP_SETTINGS_KEY } from "@/constants/index";

export type OptionRow = {
  id: string;
  key: string;
  value: unknown;
  autoload: boolean;
  createdAt: string;
  updatedAt: string;
};

type OptionFormProps = {
  mode: "create" | "edit";
  option?: OptionRow;
  onSuccess?: () => void;
};

const DEFAULT_VALUE_BY_TYPE: Record<OptionValueType, string> = {
  string: "",
  number: "0",
  boolean: "false",
  null: "",
  json: "{}",
};

export default function OptionForm({ mode, option, onSuccess }: OptionFormProps) {
  if (mode === "edit" && option?.key === GLOBAL_SETTINGS_KEY) {
    return (
      <GlobalSettingsForm
        initialValues={option.value as Partial<GlobalSettings>}
        onSuccess={onSuccess}
      />
    );
  }

  if (mode === "edit" && option?.key === SMTP_SETTINGS_KEY) {
    return (
      <SmtpSettingsForm
        initialValues={option.value as Partial<SmtpSettings>}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <GenericOptionForm
      mode={mode}
      option={option}
      onSuccess={onSuccess}
    />
  );
}

function GenericOptionForm({ mode, option, onSuccess }: OptionFormProps) {
  const initialType = option
    ? detectOptionValueType(option.value)
    : ("string" as OptionValueType);

  const [key, setKey] = useState(option?.key ?? "");
  const [valueType, setValueType] = useState<OptionValueType>(initialType);
  const [value, setValue] = useState(
    formatOptionValueForForm(option?.value, initialType)
  );
  const [autoload, setAutoload] = useState(option?.autoload ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextType = option
      ? detectOptionValueType(option.value)
      : ("string" as OptionValueType);

    setKey(option?.key ?? "");
    setValueType(nextType);
    setValue(formatOptionValueForForm(option?.value, nextType));
    setAutoload(option?.autoload ?? true);
  }, [option?.id, option?.key, option?.value, option?.autoload]);

  function handleValueTypeChange(nextType: OptionValueType) {
    setValueType(nextType);
    setValue(DEFAULT_VALUE_BY_TYPE[nextType]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!key.trim()) {
      toast.error("Key is required");
      return;
    }

    let parsedValue: unknown;

    try {
      parsedValue = parseOptionValue(valueType, value);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid option value"
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      key: key.trim(),
      valueType,
      value: parsedValue,
      autoload,
    };

    const res =
      mode === "create"
        ? await createOption(payload)
        : await updateOption(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create"
          ? "Option created successfully"
          : "Option updated successfully"
      );
      onSuccess?.();
      return;
    }

    toast.error(res.error ?? `Failed to ${mode} option`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4">
      <div className="space-y-2">
        <Label htmlFor="optionKey">Key</Label>
        <Input
          id="optionKey"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="my_option_key"
          required
          disabled={mode === "edit"}
        />
      </div>

      <AppSelect
        label="Value type"
        value={valueType}
        onValueChange={(nextValue) =>
          handleValueTypeChange(nextValue as OptionValueType)
        }
        options={OPTION_VALUE_TYPES}
      />

      {valueType === "string" && (
        <div className="space-y-2">
          <Label htmlFor="optionValue">Text value</Label>
          <Textarea
            id="optionValue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Plain text value"
            rows={6}
          />
        </div>
      )}

      {valueType === "number" && (
        <div className="space-y-2">
          <Label htmlFor="optionValue">Number value</Label>
          <Input
            id="optionValue"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      )}

      {valueType === "boolean" && (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="space-y-0.5">
            <Label htmlFor="optionValue">Boolean value</Label>
            <p className="text-xs text-muted-foreground">
              Store true or false for this option.
            </p>
          </div>
          <Switch
            id="optionValue"
            checked={value === "true"}
            onCheckedChange={(checked) =>
              setValue(checked ? "true" : "false")
            }
          />
        </div>
      )}

      {valueType === "null" && (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          This option will store a null value.
        </div>
      )}

      {valueType === "json" && (
        <div className="space-y-2">
          <Label htmlFor="optionValue">JSON value</Label>
          <Textarea
            id="optionValue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='{"enabled": true}'
            rows={12}
            className="font-mono text-sm"
            required
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="optionAutoload">Autoload</Label>
          <p className="text-xs text-muted-foreground">
            Load this option automatically with other autoload options.
          </p>
        </div>
        <Switch
          id="optionAutoload"
          checked={autoload}
          onCheckedChange={setAutoload}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
            ? "Create Option"
            : "Update Option"}
      </Button>
    </form>
  );
}
