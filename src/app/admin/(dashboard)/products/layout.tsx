import { RouteGuard } from "@/components/admin/route-guard";

export default function ProductsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="products:read">{children}</RouteGuard>;
}
