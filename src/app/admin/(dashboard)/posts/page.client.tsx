"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { deletePost } from "@/actions/posts/delete-post";
import { updatePostSeo } from "@/actions/posts/update-post-seo";
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
import { Post } from "@/generated/prisma/browser";
import {
  hasSeoConfigured,
  metaToSeo,
  truncateSeoText,
  type SeoInput,
} from "@/lib/meta/seo";
import { toast } from "@/lib/toast";

type PostRow = Post & {
  slug: string;
  author?: { id: string; name: string | null } | null;
  featuredImage?: { url: string } | null;
  tags?: { name: string }[];
  categories?: { name: string }[];
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

function PostRowActions({
  post,
  onEditSeo,
}: {
  post: PostRow;
  onEditSeo: (post: PostRow) => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    const res = await deletePost(post.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Post deleted successfully");
      router.refresh();
      return;
    }

    toast.error(res.error ?? "Failed to delete post");
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
          <Link
            href={`/posts/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="text-muted-foreground" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/posts/${post.id}`}>
            <Pencil className="text-muted-foreground" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditSeo(post)}>
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

const PostClient = ({
  initialData,
}: {
  initialData: {
    docs: PostRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}) => {
  const router = useRouter();
  const [seoDialogPost, setSeoDialogPost] = useState<PostRow | null>(null);

  const columns: DataTableColumn<PostRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <Link className="link" href={`/admin/posts/${row.id}`}>
          {row.title}
        </Link>
      ),
    },
    { id: "slug", header: "Slug", accessorKey: "slug" },
    {
      id: "author",
      header: "Author",
      cell: (row) => row.author?.name ?? "—",
    },
    {
      id: "featuredImage",
      header: "Featured Image",
      cell: (row) =>
        row.featuredImage?.url ? (
          <Image
            src={row.featuredImage.url}
            alt={row.title}
            width={100}
            height={100}
            className="rounded object-cover"
          />
        ) : (
          "—"
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
      id: "tags",
      header: "Tags",
      cell: (row) => row.tags?.map((tag) => tag.name).join(", ") || "—",
    },
    {
      id: "categories",
      header: "Categories",
      cell: (row) =>
        row.categories?.map((category) => category.name).join(", ") || "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <PostRowActions post={row} onEditSeo={setSeoDialogPost} />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={initialData.docs}
        getRowKey={(row) => row.id}
      />

      {seoDialogPost ? (
        <SeoEditDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setSeoDialogPost(null);
            }
          }}
          contentTitle={seoDialogPost.title}
          initialSeo={metaToSeo(seoDialogPost.meta ?? [])}
          titlePlaceholder="Leave blank to use the post title"
          onSave={(seo) => updatePostSeo(seoDialogPost.id, seo)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </>
  );
};

export default PostClient;
