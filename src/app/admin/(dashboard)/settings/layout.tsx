import { RouteGuard } from "@/components/admin/route-guard";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="settings:manage">{children}</RouteGuard>;
}
