import { RouteGuard } from "@/components/admin/route-guard";

export default function PagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="pages:read">{children}</RouteGuard>;
}
