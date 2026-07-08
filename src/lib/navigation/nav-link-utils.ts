import type { GlobalNavChildLink, GlobalNavLink } from "@/types/settings";

import type { SiteNavLink } from "./site-nav";

export function normalizeGlobalNavChildLink(
  link: Partial<GlobalNavChildLink> & { id: string }
): GlobalNavChildLink {
  return {
    id: link.id,
    title: link.title ?? "",
    href: link.href ?? "",
    enabled: link.enabled ?? true,
  };
}

export function normalizeGlobalNavLink(
  link: Partial<GlobalNavLink> & { id: string }
): GlobalNavLink {
  const type = link.type === "dropdown" ? "dropdown" : "link";

  return {
    id: link.id,
    type,
    title: link.title ?? "",
    href: link.href ?? "",
    enabled: link.enabled ?? true,
    children:
      type === "dropdown"
        ? (link.children ?? []).map((child) =>
            normalizeGlobalNavChildLink({
              ...child,
              id: child.id ?? crypto.randomUUID(),
            })
          )
        : [],
  };
}

export function flattenSiteNavLinks(links: SiteNavLink[]): SiteNavLink[] {
  return links.flatMap((link) => {
    const items: SiteNavLink[] = [];

    if (link.href) {
      items.push({ title: link.title, href: link.href });
    }

    if (link.children?.length) {
      items.push(...link.children);
    }

    return items;
  });
}
