import { RouteGuard } from "@/components/admin/route-guard";

export default function LogsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="logs:read">{children}</RouteGuard>;
}
