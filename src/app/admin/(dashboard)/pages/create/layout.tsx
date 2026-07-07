import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata("Create Page", "Add a new site page.");

export default function CreatePageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
