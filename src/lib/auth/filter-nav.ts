import type { AppUserRole } from "@/lib/auth/roles";
import { data } from "@/data/sidebar-data";
import { getNavPermission, hasPermission } from "@/lib/auth/permissions";

export function getNavForRole(role: AppUserRole) {
  return data.navMain
    .map((item) => {
      if (item.items) {
        const items = item.items.filter((subItem) => {
          const permission = getNavPermission(subItem.url);
          return !permission || hasPermission(role, permission);
        });

        if (items.length === 0) {
          return null;
        }

        return {
          ...item,
          items,
        };
      }

      const permission = getNavPermission(item.url);
      if (permission && !hasPermission(role, permission)) {
        return null;
      }

      return item;
    })
    .filter((item): item is (typeof data.navMain)[number] => item !== null);
}
