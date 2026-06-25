"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { SiteNavLink } from "@/lib/navigation/site-nav";

type SiteHeaderProps = {
  siteTitle: string;
  navLinks: SiteNavLink[];
};

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
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
      <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
        {navLinks.map((link) => {
          const active = isActiveLink(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
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

export function SiteHeader({ siteTitle, navLinks }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold tracking-tight"
        >
          <ShoppingBag className="size-5 shrink-0" aria-hidden />
          <span className="truncate">{siteTitle}</span>
        </Link>

        <NavLinks
          navLinks={navLinks}
          pathname={pathname}
          className="hidden md:block"
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>{siteTitle}</SheetTitle>
            </SheetHeader>
            <NavLinks
              navLinks={navLinks}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              className="mt-6"
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
