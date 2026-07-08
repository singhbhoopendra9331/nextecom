import Link from "next/link";
import { LayoutTemplate, PanelBottom } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { GLOBALS_ITEMS } from "@/lib/settings/constants";
import { ensureDefaultOptions } from "@/lib/settings";

export const metadata = createAdminMetadata(
  "Globals",
  "Manage global settings for the site."
);

const GLOBAL_ICONS: Record<string, LucideIcon> = {
  "global-header": LayoutTemplate,
  "global-footer": PanelBottom,
};

export default async function GlobalsPage() {
  await ensureDefaultOptions();

  return (
    <div className="min-h-screen p-2 md:p-4">
      <PageTitle
        title="Globals"
        description="Configure site-wide settings."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {GLOBALS_ITEMS.map((item) => {
          const Icon = GLOBAL_ICONS[item.key] ?? LayoutTemplate;

          return (
            <Link
              key={item.key}
              href={item.href}
              className="block transition-opacity hover:opacity-90"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Icon className="size-5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Key: <code>{item.key}</code>
                  </p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
