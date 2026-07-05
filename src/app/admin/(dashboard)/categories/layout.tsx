import { RouteGuard } from "@/components/admin/route-guard";

export default function CategoriesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="posts:read">{children}</RouteGuard>;
}
