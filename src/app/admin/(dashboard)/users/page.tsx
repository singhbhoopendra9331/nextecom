import { Button } from "@/components/ui/button";
import Link from "next/link";
import { axios } from "@/lib/axios";
import UsersPageClient from "./page.client";
import { PageTitle } from "@/components/page-title";


export default async function Page() {
  const users = await axios.get("/api/users");
  if (!users.data) throw new Error("Failed to fetch users");

  console.log("users >>", users.data);

  return (
    <div className="min-h-screen p-2 md:p-4 space-y-6">
      <PageTitle title="Users" description="Manage your users">
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/users/create">Add User</Link>
        </Button>
      </PageTitle>
      {/* user search and listing */}
      <UsersPageClient users={users.data.docs} />
    </div>
  );
}