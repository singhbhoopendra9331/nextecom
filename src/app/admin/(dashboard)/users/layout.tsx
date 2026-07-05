import { RouteGuard } from "@/components/admin/route-guard";

export default function UsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="users:manage">{children}</RouteGuard>;
}
