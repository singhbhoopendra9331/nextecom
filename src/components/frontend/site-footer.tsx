import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import type { SiteNavLink } from "@/lib/navigation/site-nav";
import type { GlobalSettings } from "@/types/settings";

type SiteFooterProps = {
  settings: GlobalSettings;
  navLinks: SiteNavLink[];
};

export function SiteFooter({ settings, navLinks }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const hasContact =
    settings.contactEmail || settings.contactPhone || settings.address;

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-lg font-semibold">{settings.siteTitle}</p>
            {settings.siteTagline ? (
              <p className="text-sm text-muted-foreground">
                {settings.siteTagline}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Quick links</p>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
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

          {hasContact ? (
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

        <p className="text-center text-sm text-muted-foreground">
          &copy; {year} {settings.siteTitle}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
