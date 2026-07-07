"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2, Inbox } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { deleteForm } from "@/actions/forms/delete-form";
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
import { Form, FormStatus } from "@/generated/prisma/browser";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

type FormRow = Form & {
  _count?: { submissions: number };
};

function statusVariant(status: FormStatus) {
  return status === "ACTIVE" ? "default" : "secondary";
}

function FormRowActions({
  form,
  onChanged,
}: {
  form: FormRow;
  onChanged: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${form.title}"? This will also delete all submissions.`)) {
      return;
    }

    setIsDeleting(true);

    const res = await deleteForm(form.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Form deleted successfully");
      onChanged();
      return;
    }

    toast.error(res.error ?? "Failed to delete form");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/forms/${form.slug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="text-muted-foreground" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/forms/${form.id}/edit`}>
            <Pencil className="text-muted-foreground" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/forms/${form.id}/submissions`}>
            <Inbox className="text-muted-foreground" />
            Submissions
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

export default function FormsPageClient({
  initialData,
}: {
  initialData: {
    docs: FormRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const skipSearchEffect = useRef(true);

  const fetchForms = useCallback(
    (page: number, searchTerm: string) => {
      startTransition(async () => {
        const response = await axios.get("/api/forms", {
          params: {
            page,
            limit: data.pagination.limit,
            search: searchTerm.trim(),
          },
        });

        setData(response.data);
      });
    },
    [data.pagination.limit]
  );

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      fetchForms(1, search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, fetchForms]);

  const columns: DataTableColumn<FormRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <Link className="link" href={`/admin/forms/${row.id}/edit`}>
          {row.title}
        </Link>
      ),
    },
    { id: "slug", header: "Slug", accessorKey: "slug" },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>{row.status.toLowerCase()}</Badge>
      ),
    },
    {
      id: "submissions",
      header: "Submissions",
      cell: (row) => row._count?.submissions ?? 0,
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (row) => format(new Date(row.updatedAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <FormRowActions
          form={row}
          onChanged={() => fetchForms(data.pagination.page, search)}
        />
      ),
    },
  ];

  return (
    <DataTable
      showHeader={false}
      columns={columns}
      data={data.docs}
      getRowKey={(row) => row.id}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search forms..."
      isLoading={isPending}
      pagination={data.pagination}
      onPageChange={(page) => fetchForms(page, search)}
      emptyMessage={
        search.trim()
          ? "No forms match your search."
          : "No forms yet. Create your first form."
      }
    />
  );
}
