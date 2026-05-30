"use client";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { User } from "@/generated/prisma/client";
import Link from "next/link";

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
            <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/users/${row.id}`}>Edit</Link>
            </Button>
        ),
    },
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