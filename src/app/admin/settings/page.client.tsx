"use client";

import { useState } from "react";

import { updateGlobalSettings } from "@/actions/settings/update-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type GlobalSettings } from "@/lib/settings";
import { toast } from "@/lib/toast";

export default function SettingsPageClient({
  initialSettings,
}: {
  initialSettings: GlobalSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await updateGlobalSettings(settings);

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Settings saved successfully");
      return;
    }

    toast.error(res.error ?? "Failed to save settings");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">General</h2>

        <div className="space-y-2">
          <Label htmlFor="siteTitle">Site Title</Label>
          <Input
            id="siteTitle"
            value={settings.siteTitle}
            onChange={(e) => updateField("siteTitle", e.target.value)}
            placeholder="Your store name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteTagline">Tagline</Label>
          <Textarea
            id="siteTagline"
            value={settings.siteTagline}
            onChange={(e) => updateField("siteTagline", e.target.value)}
            placeholder="Short description of your site"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Contact</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="hello@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={settings.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={settings.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Business address"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Regional</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={settings.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              placeholder="USD"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={settings.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              placeholder="UTC"
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
