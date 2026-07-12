"use client";

import { useEffect, useState } from "react";

import { sendTestEmail } from "@/actions/settings/send-test-email";
import { updateSmtpSettings } from "@/actions/settings/update-smtp-settings";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SMTP_SETTINGS,
} from "@/lib/settings/constants";
import { toast } from "@/lib/toast";
import { SmtpEncryption, SmtpSettings } from "@/types/settings";

const ENCRYPTION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "tls", label: "TLS" },
  { value: "ssl", label: "SSL" },
];

type SmtpSettingsFormProps = {
  initialValues?: Partial<SmtpSettings>;
  onSuccess?: () => void;
};

export default function SmtpSettingsForm({
  initialValues,
  onSuccess,
}: SmtpSettingsFormProps) {
  const [settings, setSettings] = useState<SmtpSettings>({
    ...DEFAULT_SMTP_SETTINGS,
    ...initialValues,
  });
  const [testRecipient, setTestRecipient] = useState(
    initialValues?.fromEmail ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setSettings({
      ...DEFAULT_SMTP_SETTINGS,
      ...initialValues,
    });
    setTestRecipient(initialValues?.fromEmail ?? "");
  }, [initialValues]);

  function updateField<K extends keyof SmtpSettings>(
    key: K,
    value: SmtpSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await updateSmtpSettings(settings);

    setIsSubmitting(false);

    if (res.success) {
      toast.success("SMTP settings saved successfully");
      onSuccess?.();
      return;
    }

    toast.error(res.error ?? "Failed to save SMTP settings");
  }

  async function handleSendTestEmail() {
    if (!testRecipient.trim()) {
      toast.error("Recipient email is required");
      return;
    }

    setIsTesting(true);

    const res = await sendTestEmail({
      to: testRecipient,
      smtp: settings,
    });

    setIsTesting(false);

    if (res.success) {
      toast.success("Test email sent successfully");
      return;
    }

    toast.error(res.error ?? "Failed to send test email");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4">
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="smtpEnabled">Enable SMTP</Label>
          <p className="text-xs text-muted-foreground">
            Turn on outbound email delivery using SMTP.
          </p>
        </div>
        <Switch
          id="smtpEnabled"
          checked={settings.enabled}
          onCheckedChange={(checked) => updateField("enabled", checked)}
        />
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Server</h3>

        <div className="space-y-2">
          <Label htmlFor="smtpHost">Host</Label>
          <Input
            id="smtpHost"
            value={settings.host}
            onChange={(e) => updateField("host", e.target.value)}
            placeholder="smtp.example.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtpPort">Port</Label>
            <Input
              id="smtpPort"
              type="number"
              min={1}
              max={65535}
              value={settings.port}
              onChange={(e) => updateField("port", Number(e.target.value))}
              placeholder="587"
            />
          </div>

          <AppSelect
            label="Encryption"
            name="encryption"
            value={settings.encryption}
            onValueChange={(value) =>
              updateField("encryption", value as SmtpEncryption)
            }
            options={ENCRYPTION_OPTIONS}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Authentication</h3>

        <div className="space-y-2">
          <Label htmlFor="smtpUsername">Username</Label>
          <Input
            id="smtpUsername"
            value={settings.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="smtp-user"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPassword">Password</Label>
          <Input
            id="smtpPassword"
            type="password"
            value={settings.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Sender</h3>

        <div className="space-y-2">
          <Label htmlFor="smtpFromEmail">From email</Label>
          <Input
            id="smtpFromEmail"
            type="email"
            value={settings.fromEmail}
            onChange={(e) => updateField("fromEmail", e.target.value)}
            placeholder="noreply@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpFromName">From name</Label>
          <Input
            id="smtpFromName"
            value={settings.fromName}
            onChange={(e) => updateField("fromName", e.target.value)}
            placeholder="NextEcom"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Test email</h3>
          <p className="text-xs text-muted-foreground">
            Send a test message using the settings above without saving.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpTestRecipient">Recipient email</Label>
          <Input
            id="smtpTestRecipient"
            type="email"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isTesting || isSubmitting}
          onClick={handleSendTestEmail}
          className="w-full"
        >
          {isTesting ? "Sending..." : "Send Test Email"}
        </Button>
      </section>

      <Button type="submit" disabled={isSubmitting || isTesting} className="w-full">
        {isSubmitting ? "Saving..." : "Save SMTP Settings"}
      </Button>
    </form>
  );
}
