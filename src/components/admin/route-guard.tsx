import { requirePermission } from "@/lib/auth/require-auth";
import type { Permission } from "@/lib/auth/permissions";

type RouteGuardProps = {
  permission: Permission;
  children: React.ReactNode;
};

export async function RouteGuard({ permission, children }: RouteGuardProps) {
  await requirePermission(permission);
  return children;
}
