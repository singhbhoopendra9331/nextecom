export type SiteNavLink = {
  title: string;
  href: string;
  children?: SiteNavLink[];
};

export function isDropdownNavLink(link: SiteNavLink) {
  return Boolean(link.children?.length);
}

export const PRIMARY_NAV_LINKS: SiteNavLink[] = [
  { title: "Home", href: "/" },
  { title: "Posts", href: "/posts" },
];
