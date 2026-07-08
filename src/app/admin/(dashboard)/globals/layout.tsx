import { RouteGuard } from "@/components/admin/route-guard";

export default function GlobalsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="settings:manage">{children}</RouteGuard>;
}
