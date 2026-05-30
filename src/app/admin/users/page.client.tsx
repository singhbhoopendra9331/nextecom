"use client";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { User } from "@/generated/prisma/client";

const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name" },
    { id: "email", header: "Email" },
    { id: "actions", header: "Actions" },
];

const UsersPageClient = ({
    users,
}: {
    users: User[];
}) => {
    console.log("client users >>>", users);
    return <div>
        <DataTable columns={columns} data={users} />
    </div>;
};

export default UsersPageClient;