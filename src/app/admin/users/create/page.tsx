import Link from "next/link";

import CreateUserPageClient from "./page.client";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">Create User</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>

      <CreateUserPageClient />
    </div>
  );
}
