import { RouteGuard } from "@/components/admin/route-guard";

export default function CommentsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard permission="comments:read">{children}</RouteGuard>;
}
