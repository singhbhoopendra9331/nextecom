import { getAllOptions } from "@/lib/options";
import { ensureDefaultOptions } from "@/lib/settings";
import { createAdminMetadata } from "@/lib/admin/metadata";

import SettingsPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";

export const metadata = createAdminMetadata(
  "Settings",
  "Manage site and application settings."
);

export default async function SettingsPage() {
  await ensureDefaultOptions();

  const options = await getAllOptions();

  const serializedOptions = options.map((option) => ({
    id: option.id,
    key: option.key,
    value: option.value,
    autoload: option.autoload,
    createdAt: option.createdAt.toISOString(),
    updatedAt: option.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen p-2 md:p-4">
      <PageTitle title="Settings" description="Manage your settings"/>
      <SettingsPageClient initialOptions={serializedOptions} />
    </div>
  );
}
