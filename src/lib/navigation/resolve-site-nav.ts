import type { GlobalHeaderSettings } from "@/types/settings";

import { normalizeGlobalNavLink } from "./nav-link-utils";
import { PRIMARY_NAV_LINKS, type SiteNavLink } from "./site-nav";

function resolveCustomNavLinks(
  customNavLinks: GlobalHeaderSettings["customNavLinks"]
): SiteNavLink[] {
  return customNavLinks
    .map((link) => normalizeGlobalNavLink({ ...link, id: link.id }))
    .filter((link) => link.enabled && link.title.trim())
    .map((link) => {
      if (link.type === "dropdown") {
        const children = link.children
          .filter(
            (child) => child.enabled && child.title.trim() && child.href.trim()
          )
          .map((child) => ({
            title: child.title.trim(),
            href: child.href.trim(),
          }));

        if (children.length === 0) {
          return null;
        }

        return {
          title: link.title.trim(),
          href: link.href.trim(),
          children,
        };
      }

      if (!link.href.trim()) {
        return null;
      }

      return {
        title: link.title.trim(),
        href: link.href.trim(),
      };
    })
    .filter((link): link is SiteNavLink => link !== null);
}

export function resolveSiteNavLinks(
  headerSettings: GlobalHeaderSettings,
  cmsPages: SiteNavLink[]
): SiteNavLink[] {
  if (headerSettings.navMode === "custom") {
    return resolveCustomNavLinks(headerSettings.customNavLinks);
  }

  const links: SiteNavLink[] = [];

  if (headerSettings.includePrimaryNav) {
    links.push(...PRIMARY_NAV_LINKS);
  }

  if (headerSettings.includeCmsPages) {
    links.push(...cmsPages);
  }

  return links;
}
