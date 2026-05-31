"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { User } from "@/generated/prisma/browser";

import UserForm from "./user-form";

function UserRowActions({
  user,
  onEdit,
}: {
  user: User;
  onEdit: (user: User) => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
      Edit
    </Button>
  );
}

const UsersPageClient = ({ users }: { users: User[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function openEditSheet(user: User) {
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

  const columns: DataTableColumn<User>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (row) => row.name ?? "—",
    },
    { id: "email", header: "Email", accessorKey: "email" },
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
            initialValues={{
              name: selectedUser.name,
              email: selectedUser.email,
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
