import { PRIMARY_NAV_LINKS } from "@/lib/navigation/site-nav";
import { getPublishedNavPages } from "@/lib/pages/get-published-nav-pages";
import { getGlobalSettings } from "@/lib/settings";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type SiteShellProps = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: SiteShellProps) {
  const [settings, cmsPages] = await Promise.all([
    getGlobalSettings(),
    getPublishedNavPages(),
  ]);

  const navLinks = [...PRIMARY_NAV_LINKS, ...cmsPages];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader siteTitle={settings.siteTitle} navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} navLinks={navLinks} />
    </div>
  );
}
