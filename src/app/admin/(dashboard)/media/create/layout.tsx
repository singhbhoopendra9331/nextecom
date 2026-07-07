import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata(
  "Upload Media",
  "Upload a new media file."
);

export default function CreateMediaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
