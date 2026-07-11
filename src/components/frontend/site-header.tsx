"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isDropdownNavLink, type SiteNavLink } from "@/lib/navigation/site-nav";
import { cn } from "@/lib/utils";
import type { GlobalHeaderSettings } from "@/types/settings";

type SiteHeaderProps = {
  siteTitle: string;
  navLinks: SiteNavLink[];
  headerSettings: GlobalHeaderSettings;
  logoUrl?: string | null;
};

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavItemActive(pathname: string, link: SiteNavLink) {
  if (link.href && isActiveLink(pathname, link.href)) {
    return true;
  }

  return link.children?.some((child) => isActiveLink(pathname, child.href)) ?? false;
}

function linkClassName(active: boolean, className?: string) {
  return cn(
    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    className
  );
}

function DesktopNavDropdown({ link, pathname }: { link: SiteNavLink; pathname: string }) {
  const active = isNavItemActive(pathname, link);

  return (
    <li className="flex items-center">
      {link.href ? (
        <Link href={link.href} className={linkClassName(isActiveLink(pathname, link.href), "rounded-r-none")}>
          {link.title}
        </Link>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 px-2",
              !link.href && linkClassName(active, "h-9"),
              link.href && "h-9 rounded-l-none"
            )}
          >
            {!link.href ? link.title : null}
            <ChevronDown className="size-4" />
            <span className="sr-only">{link.title} menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {link.children?.map((child) => (
            <DropdownMenuItem key={child.href} asChild>
              <Link
                href={child.href}
                className={cn(isActiveLink(pathname, child.href) && "bg-accent")}
              >
                {child.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function DesktopNavLinks({
  navLinks,
  pathname,
}: {
  navLinks: SiteNavLink[];
  pathname: string;
}) {
  return (
    <nav>
      <ul className="flex items-center gap-1">
        {navLinks.map((link) => {
          if (isDropdownNavLink(link)) {
            return (
              <DesktopNavDropdown
                key={`${link.title}-${link.href}`}
                link={link}
                pathname={pathname}
              />
            );
          }

          const active = isActiveLink(pathname, link.href);

          return (
            <li key={link.href}>
              <Link href={link.href} className={linkClassName(active)}>
                {link.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNavDropdown({
  link,
  pathname,
  onNavigate,
}: {
  link: SiteNavLink;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavItemActive(pathname, link);
  const [open, setOpen] = useState(active);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        {link.href ? (
          <Link
            href={link.href}
            onClick={onNavigate}
            className={cn(linkClassName(isActiveLink(pathname, link.href)), "flex-1")}
          >
            {link.title}
          </Link>
        ) : (
          <CollapsibleTrigger className={cn(linkClassName(active), "flex-1 text-left")}>
            {link.title}
          </CollapsibleTrigger>
        )}

        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9 shrink-0">
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
            <span className="sr-only">Toggle {link.title} menu</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <ul className="ml-3 mt-1 space-y-1 border-l pl-3">
          {link.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className={linkClassName(isActiveLink(pathname, child.href))}
              >
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MobileNavLinks({
  navLinks,
  pathname,
  onNavigate,
  className,
}: {
  navLinks: SiteNavLink[];
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={className}>
      <ul className="flex flex-col gap-1">
        {navLinks.map((link) => {
          if (isDropdownNavLink(link)) {
            return (
              <li key={`${link.title}-${link.href}`}>
                <MobileNavDropdown
                  link={link}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              </li>
            );
          }

          const active = isActiveLink(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={linkClassName(active)}
              >
                {link.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteHeader({
  siteTitle,
  navLinks,
  headerSettings,
  logoUrl,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold tracking-tight"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${siteTitle} logo`}
              width={28}
              height={28}
              className="size-7 shrink-0 object-contain"
            />
          ) : (
            <ShoppingBag className="size-5 shrink-0" aria-hidden />
          )}
          {headerSettings.showSiteTitle ? (
            <span className="truncate">{siteTitle}</span>
          ) : null}
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <DesktopNavLinks navLinks={navLinks} pathname={pathname} />
          {headerSettings.cta.enabled ? (
            <Button asChild size="sm">
              <Link href={headerSettings.cta.href}>{headerSettings.cta.label}</Link>
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {headerSettings.cta.enabled ? (
            <Button asChild size="sm">
              <Link href={headerSettings.cta.href}>{headerSettings.cta.label}</Link>
            </Button>
          ) : null}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{siteTitle}</SheetTitle>
              </SheetHeader>
              <MobileNavLinks
                navLinks={navLinks}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                className="mt-6"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
