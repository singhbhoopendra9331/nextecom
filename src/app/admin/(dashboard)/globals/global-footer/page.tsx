import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { ensureDefaultOptions, getGlobalFooterSettings } from "@/lib/settings";

import FooterSettingsForm from "./footer-settings-form";

export const metadata = createAdminMetadata(
  "Global Footer",
  "Configure the site footer content and links."
);

export default async function GlobalFooterPage() {
  await ensureDefaultOptions();

  const settings = await getGlobalFooterSettings();

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/globals">
            <ArrowLeft className="size-4" />
            Back to Globals
          </Link>
        </Button>
      </div>

      <PageTitle
        title="Global Footer"
        description="Manage footer columns, social links, and copyright text."
      />

      <FooterSettingsForm initialValues={settings} />
    </div>
  );
}
