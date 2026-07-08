import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";
import { ensureDefaultOptions, getGlobalHeaderSettings } from "@/lib/settings";

import HeaderSettingsForm from "./header-settings-form";

export const metadata = createAdminMetadata(
  "Global Header",
  "Configure the site header navigation and branding."
);

export default async function GlobalHeaderPage() {
  await ensureDefaultOptions();

  const settings = await getGlobalHeaderSettings();

  const initialLogo = settings.logoMediaId
    ? await prisma.media.findUnique({
        where: { id: settings.logoMediaId },
        select: { id: true, url: true, originalName: true },
      })
    : null;

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
        title="Global Header"
        description="Manage logo, navigation links, and header call-to-action."
      />

      <HeaderSettingsForm initialValues={settings} initialLogo={initialLogo} />
    </div>
  );
}
