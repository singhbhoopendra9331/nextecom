"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { updateRedirectsSettings } from "@/actions/settings/update-redirects-settings";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_REDIRECTS_SETTINGS } from "@/lib/settings/constants";
import { toast } from "@/lib/toast";
import type { RedirectRule, RedirectsSettings } from "@/types/settings";

const REDIRECT_TYPE_OPTIONS = [
  { value: "301", label: "301 Permanent" },
  { value: "302", label: "302 Temporary" },
];

type RedirectsSettingsFormProps = {
  initialValues?: Partial<RedirectsSettings>;
  onSuccess?: () => void;
};

function createEmptyRule(): RedirectRule {
  return {
    id: crypto.randomUUID(),
    from: "",
    to: "",
    type: 301,
    enabled: true,
  };
}

export default function RedirectsSettingsForm({
  initialValues,
  onSuccess,
}: RedirectsSettingsFormProps) {
  const [rules, setRules] = useState<RedirectRule[]>(
    initialValues?.rules ?? DEFAULT_REDIRECTS_SETTINGS.rules
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRules(initialValues?.rules ?? DEFAULT_REDIRECTS_SETTINGS.rules);
  }, [initialValues]);

  function updateRule(id: string, patch: Partial<RedirectRule>) {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule))
    );
  }

  function addRule() {
    setRules((current) => [...current, createEmptyRule()]);
  }

  function removeRule(id: string) {
    setRules((current) => current.filter((rule) => rule.id !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const res = await updateRedirectsSettings({ rules });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Redirects saved successfully");
      onSuccess?.();
      return;
    }

    toast.error(res.error ?? "Failed to save redirects");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4">
      <p className="text-sm text-muted-foreground">
        Map old URLs to new destinations. Source paths must start with{" "}
        <code className="text-xs">/</code>. Destinations can be a path or full
        URL.
      </p>

      {rules.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No redirects yet. Add your first redirect rule.
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="space-y-3 rounded-md border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Redirect {index + 1}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`redirect-enabled-${rule.id}`}
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        updateRule(rule.id, { enabled: checked })
                      }
                    />
                    <Label
                      htmlFor={`redirect-enabled-${rule.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Enabled
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove redirect</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`redirect-from-${rule.id}`}>From</Label>
                  <Input
                    id={`redirect-from-${rule.id}`}
                    value={rule.from}
                    onChange={(event) =>
                      updateRule(rule.id, { from: event.target.value })
                    }
                    placeholder="/old-path"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`redirect-to-${rule.id}`}>To</Label>
                  <Input
                    id={`redirect-to-${rule.id}`}
                    value={rule.to}
                    onChange={(event) =>
                      updateRule(rule.id, { to: event.target.value })
                    }
                    placeholder="/new-path or https://example.com"
                    required
                  />
                </div>
              </div>

              <AppSelect
                label="Type"
                value={String(rule.type)}
                onValueChange={(value) =>
                  updateRule(rule.id, {
                    type: value === "302" ? 302 : 301,
                  })
                }
                options={REDIRECT_TYPE_OPTIONS}
              />
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addRule}>
        <Plus className="h-4 w-4" />
        Add Redirect
      </Button>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Redirects"}
      </Button>
    </form>
  );
}
