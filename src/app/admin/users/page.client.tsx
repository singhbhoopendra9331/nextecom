"use client";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { User } from "@/generated/prisma/client";

const columns: DataTableColumn<User>[] = [
    {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: (row) => row.name ?? "—",
    },
    { id: "email", header: "Email", accessorKey: "email" },
    { id: "actions", header: "Actions" },
];

const UsersPageClient = ({
    users,
}: {
    users: User[];
}) => {
    return (
        <DataTable
            columns={columns}
            data={users}
            getRowKey={(row) => row.id}
        />
    );
};

export default UsersPageClient;