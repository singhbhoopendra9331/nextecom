export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

export type AppUserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_LABELS: Record<AppUserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Admin",
  [UserRole.EDITOR]: "Editor",
  [UserRole.VIEWER]: "Viewer",
};

export const ASSIGNABLE_ROLES: AppUserRole[] = [
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.VIEWER,
];
