import type { Metadata } from "next";

import { ADMIN_SITE_NAME } from "@/constants/index";

export const ADMIN_DEFAULT_METADATA: Metadata = {
  title: {
    template: `%s | ${ADMIN_SITE_NAME}`,
    default: "Dashboard",
  },
  description: "Manage your site content and settings.",
};

export function createAdminMetadata(
  title: string,
  description?: string
): Metadata {
  return {
    title,
    description: description ?? `${title} in the admin dashboard.`,
  };
}
