import { queryApplicationLogs } from "@/lib/logs";
import { createAdminMetadata } from "@/lib/admin/metadata";

import LogsPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Logs",
  "View application logs and errors."
);

export default async function LogsPage() {
  const initialData = await queryApplicationLogs({
    page: 1,
    limit: 20,
  });

  const serializedData = {
    docs: initialData.docs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: initialData.pagination,
  };

  return (
    <div className="min-h-screen p-2 md:p-4">
      <LogsPageClient initialData={serializedData} />
    </div>
  );
}
