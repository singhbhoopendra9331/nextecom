import {
  ASSIGNABLE_ROLES,
  USER_ROLE_LABELS,
  UserRole,
  type AppUserRole,
} from "@/lib/auth/roles";

export { ASSIGNABLE_ROLES, USER_ROLE_LABELS, UserRole, type AppUserRole };

export const PERMISSIONS = {
  "posts:read": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  "posts:write": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  "pages:read": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  "pages:write": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  "forms:read": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  "forms:write": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  "media:read": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  "media:write": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  "users:manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "settings:manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "logs:read": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "logs:manage": [UserRole.SUPER_ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ROUTE_RULES: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin/users", permission: "users:manage" },
  { prefix: "/admin/settings", permission: "settings:manage" },
  { prefix: "/admin/logs", permission: "logs:read" },
  { prefix: "/admin/posts", permission: "posts:read" },
  { prefix: "/admin/tags", permission: "posts:read" },
  { prefix: "/admin/categories", permission: "posts:read" },
  { prefix: "/admin/pages", permission: "pages:read" },
  { prefix: "/admin/forms", permission: "forms:read" },
  { prefix: "/admin/media", permission: "media:read" },
];

export function hasPermission(role: AppUserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly AppUserRole[]).includes(role);
}

export function hasAnyPermission(role: AppUserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function getRoutePermission(pathname: string): Permission | null {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.permission;
    }
  }

  return null;
}

export function canAccessRoute(role: AppUserRole, pathname: string): boolean {
  const permission = getRoutePermission(pathname);
  if (!permission) {
    return true;
  }

  return hasPermission(role, permission);
}

export function getNavPermission(url: string): Permission | null {
  if (url === "#" || url === "/admin") {
    return null;
  }

  return getRoutePermission(url);
}
