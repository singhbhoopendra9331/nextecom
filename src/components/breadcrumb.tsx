"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ADMIN_BASE = "/admin";

/** Human-readable labels for admin path segments */
const SEGMENT_LABELS: Record<string, string> = {
  "": "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  coupons: "Coupons",
  pages: "Pages",
  posts: "Posts",
  media: "Media Library",
  menus: "Menus",
  users: "Users",
  tags: "Tags",
  attributes: "Attributes",
  settings: "Settings",
};

function formatSegmentLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
  );
}

export function AdminBreadScrumb() {
  const pathname = usePathname();

  if (!pathname.startsWith(ADMIN_BASE)) {
    return null;
  }

  const pathAfterAdmin = pathname.slice(ADMIN_BASE.length).replace(/^\//, "");
  const segments = pathAfterAdmin ? pathAfterAdmin.split("/").filter(Boolean) : [];

  const items = [
    { href: ADMIN_BASE, label: "Admin" },
    ...segments.map((segment, i) => ({
      href: `${ADMIN_BASE}/${segments.slice(0, i + 1).join("/")}`,
      label: formatSegmentLabel(segment),
    })),
  ];

  if (items.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, i) => (
          <React.Fragment key={item.href}>
            {i > 0 && (
              <BreadcrumbSeparator className="hidden md:inline-flex" />
            )}
            <BreadcrumbItem className={i > 0 ? "hidden md:inline-flex" : undefined}>
              {i === items.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
