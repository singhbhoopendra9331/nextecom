import { getGlobalSettings } from "@/lib/settings";

import SettingsPageClient from "./page.client";

export default async function SettingsPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage global site information stored in the options table.
        </p>
      </div>

      <SettingsPageClient initialSettings={settings} />
    </div>
  );
}
