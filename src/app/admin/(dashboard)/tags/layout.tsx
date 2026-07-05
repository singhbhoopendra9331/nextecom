import { RouteGuard } from "@/components/admin/route-guard";

export default function TagsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="posts:read">{children}</RouteGuard>;
}
