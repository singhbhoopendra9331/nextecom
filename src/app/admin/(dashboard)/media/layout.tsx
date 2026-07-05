import { RouteGuard } from "@/components/admin/route-guard";

export default function MediaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="media:read">{children}</RouteGuard>;
}
