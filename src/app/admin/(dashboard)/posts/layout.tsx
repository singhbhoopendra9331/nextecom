import { RouteGuard } from "@/components/admin/route-guard";

export default function PostsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="posts:read">{children}</RouteGuard>;
}
