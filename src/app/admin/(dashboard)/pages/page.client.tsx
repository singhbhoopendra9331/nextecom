"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { deletePage } from "@/actions/pages/delete";
import { updatePageSeo } from "@/actions/pages/update-page-seo";
import { SeoEditDialog } from "@/components/admin/seo-edit-dialog";
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
import { Page, PostStatus } from "@/generated/prisma/browser";
import {
  hasSeoConfigured,
  metaToSeo,
  truncateSeoText,
  type SeoInput,
} from "@/lib/meta/seo";
import { toast } from "@/lib/toast";

type PageRow = Page & {
  featuredImage?: { id: string; url: string } | null;
  meta?: { key: string; value: string }[];
};

function SeoSummary({ seo, fallbackTitle }: { seo: SeoInput; fallbackTitle: string }) {
  if (!hasSeoConfigured(seo)) {
    return <span className="text-muted-foreground">Not configured</span>;
  }

  const title = seo.title?.trim() || fallbackTitle;
  const description = seo.description?.trim();

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{truncateSeoText(title, 48)}</p>
      {description ? (
        <p className="text-xs text-muted-foreground">
          {truncateSeoText(description, 72)}
        </p>
      ) : (
        <Badge variant="outline" className="text-xs">
          No description
        </Badge>
      )}
    </div>
  );
}

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

function PageRowActions({
  page,
  onEditSeo,
}: {
  page: PageRow;
  onEditSeo: (page: PageRow) => void;
}) {
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
          <Link href={`/admin/pages/${page.id}/edit`}>
            <Pencil className="text-muted-foreground" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditSeo(page)}>
          <Search className="text-muted-foreground" />
          Edit SEO
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
  const router = useRouter();
  const [seoDialogPage, setSeoDialogPage] = useState<PageRow | null>(null);

  const columns: DataTableColumn<PageRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <Link className="link" href={`/admin/pages/${row.id}/edit`}>
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
      id: "seo",
      header: "SEO",
      cell: (row) => (
        <SeoSummary
          seo={metaToSeo(row.meta ?? [])}
          fallbackTitle={row.title}
        />
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
      cell: (row) => (
        <PageRowActions page={row} onEditSeo={setSeoDialogPage} />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={initialData.docs}
        getRowKey={(row) => row.id}
        emptyMessage="No pages yet. Create your first page."
      />

      {seoDialogPage ? (
        <SeoEditDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setSeoDialogPage(null);
            }
          }}
          contentTitle={seoDialogPage.title}
          initialSeo={metaToSeo(seoDialogPage.meta ?? [])}
          onSave={(seo) => updatePageSeo(seoDialogPage.id, seo)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </>
  );
};

export default PagesPageClient;
