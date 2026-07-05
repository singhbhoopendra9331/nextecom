"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { AppUserRole } from "@/lib/auth/roles";
import { USER_ROLE_LABELS } from "@/lib/auth/roles";

import UserForm from "./user-form";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: AppUserRole;
};

function UserRowActions({
  user,
  onEdit,
}: {
  user: UserRow;
  onEdit: (user: UserRow) => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
      Edit
    </Button>
  );
}

const UsersPageClient = ({
  users,
  assignableRoles = [],
}: {
  users: UserRow[];
  assignableRoles?: AppUserRole[];
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  function openEditSheet(user: UserRow) {
    setSelectedUser(user);
    setOpen(true);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedUser(null);
    }
  }

  function handleEditSuccess() {
    handleSheetOpenChange(false);
    router.refresh();
  }

  const columns: DataTableColumn<UserRow>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (row) => row.name ?? "—",
    },
    { id: "email", header: "Email", accessorKey: "email" },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: (row) => USER_ROLE_LABELS[row.role],
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <UserRowActions user={row} onEdit={openEditSheet} />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={users} getRowKey={(row) => row.id} />

      <AppSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        title="Edit User"
        width="w-[480px]"
      >
        {selectedUser && (
          <UserForm
            mode="edit"
            userId={selectedUser.id}
            assignableRoles={assignableRoles}
            initialValues={{
              name: selectedUser.name,
              email: selectedUser.email,
              role: selectedUser.role,
            }}
            showHeader={false}
            onSuccess={handleEditSuccess}
          />
        )}
      </AppSheet>
    </>
  );
};

export default UsersPageClient;
