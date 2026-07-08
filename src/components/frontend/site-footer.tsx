import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { flattenSiteNavLinks } from "@/lib/navigation/nav-link-utils";
import type { SiteNavLink } from "@/lib/navigation/site-nav";
import type { GlobalFooterSettings, GlobalSettings } from "@/types/settings";

type SiteFooterProps = {
  settings: GlobalSettings;
  navLinks: SiteNavLink[];
  footerSettings: GlobalFooterSettings;
};

export function SiteFooter({
  settings,
  navLinks,
  footerSettings,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const tagline = footerSettings.taglineOverride || settings.siteTagline;
  const hasContact =
    settings.contactEmail || settings.contactPhone || settings.address;
  const enabledSocialLinks = footerSettings.socialLinks.filter(
    (link) => link.enabled && link.label.trim() && link.url.trim()
  );
  const enabledColumns = footerSettings.linkColumns
    .map((column) => ({
      ...column,
      links: column.links.filter(
        (link) => link.enabled && link.title.trim() && link.href.trim()
      ),
    }))
    .filter((column) => column.title.trim() && column.links.length > 0);
  const quickLinks = flattenSiteNavLinks(navLinks);

  const copyright =
    footerSettings.copyrightText.trim() ||
    `© ${year} ${settings.siteTitle}. All rights reserved.`;

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-semibold">{settings.siteTitle}</p>
            {tagline ? (
              <p className="text-sm text-muted-foreground">{tagline}</p>
            ) : null}

            {enabledSocialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-3 pt-2">
                {enabledSocialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {footerSettings.showQuickLinks ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Quick links</p>
              <ul className="space-y-2 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {enabledColumns.map((column) => (
            <div key={column.id} className="space-y-3">
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {footerSettings.showContact && hasContact ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Contact</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings.contactEmail ? (
                  <li>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                ) : null}
                {settings.contactPhone ? (
                  <li>
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {settings.contactPhone}
                    </a>
                  </li>
                ) : null}
                {settings.address ? <li>{settings.address}</li> : null}
              </ul>
            </div>
          ) : null}
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  );
}
