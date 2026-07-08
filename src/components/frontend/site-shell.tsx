import { resolveSiteNavLinks } from "@/lib/navigation/resolve-site-nav";
import { getPublishedNavPages } from "@/lib/pages/get-published-nav-pages";
import { prisma } from "@/lib/prisma";
import {
  getGlobalFooterSettings,
  getGlobalHeaderSettings,
  getGlobalSettings,
} from "@/lib/settings";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type SiteShellProps = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: SiteShellProps) {
  const [settings, headerSettings, footerSettings, cmsPages] = await Promise.all([
    getGlobalSettings(),
    getGlobalHeaderSettings(),
    getGlobalFooterSettings(),
    getPublishedNavPages(),
  ]);

  const navLinks = resolveSiteNavLinks(headerSettings, cmsPages);

  const logo = headerSettings.logoMediaId
    ? await prisma.media.findUnique({
        where: { id: headerSettings.logoMediaId },
        select: { url: true },
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        siteTitle={settings.siteTitle}
        navLinks={navLinks}
        headerSettings={headerSettings}
        logoUrl={logo?.url}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        settings={settings}
        navLinks={navLinks}
        footerSettings={footerSettings}
      />
    </div>
  );
}
