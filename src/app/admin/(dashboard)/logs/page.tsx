import { queryApplicationLogs } from "@/lib/logs";

import LogsPageClient from "./page.client";

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
