"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { deletePage } from "@/actions/pages/delete-page";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Page, PostStatus } from "@/generated/prisma/client";
import { toast } from "@/lib/toast";

type PageRow = Page & {
  featuredImage?: { id: string; url: string } | null;
};

function statusVariant(status: PostStatus) {
  switch (status) {
    case "PUBLISHED":
      return "default";
    case "ARCHIVED":
      return "secondary";
    default:
      return "outline";
  }
}

function PageRowActions({ page }: { page: PageRow }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${page.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    const res = await deletePage(page.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Page deleted successfully");
      router.refresh();
      return;
    }

    toast.error(res.error ?? "Failed to delete page");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/admin/pages/${page.id}`}>
            <Pencil className="text-muted-foreground" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <Trash2 />
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PagesPageClient = ({
  initialData,
}: {
  initialData: {
    docs: PageRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}) => {
  const columns: DataTableColumn<PageRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <Link className="link" href={`/admin/pages/${row.id}`}>
          {row.title}
        </Link>
      ),
    },
    { id: "slug", header: "Slug", accessorKey: "slug" },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (row) => format(new Date(row.updatedAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <PageRowActions page={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={initialData.docs}
      getRowKey={(row) => row.id}
      emptyMessage="No pages yet. Create your first page."
    />
  );
};

export default PagesPageClient;
