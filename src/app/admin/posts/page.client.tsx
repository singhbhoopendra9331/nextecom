"use client";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Post } from "@/generated/prisma/client";
import Link from "next/link";

const PostClient = ({
    initialData, // { docs: Post[], pagination: { page: number, limit: number, total: number, pages: number } }
}: {
    initialData: {
        docs: Post[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}) => {

    const columns: DataTableColumn<Post>[] = [
        { id: "title", header: "Title", accessorKey: "title", cell: (row) => <Link className="link" href={`/admin/posts/${row.id}`}>{row.title}</Link> },
        { id: "slug", header: "Slug", accessorKey: "slug" },
        { id: "author", header: "Author", accessorKey: "author.name" as keyof Post & "author.name" },
        { id: "featuredImage", header: "Featured Image", accessorKey: "featuredImage.url" as keyof Post },
        { id: "tags", header: "Tags", accessorKey: "tags.name" as keyof Post },
        { id: "categories", header: "Categories", accessorKey: "categories.name" as keyof Post },
    ];

    console.log("columns >>", columns);

    return (
        <DataTable
            columns={columns}
            data={initialData.docs}
            getRowKey={(row) => row.id}
        />
    );
};

export default PostClient;