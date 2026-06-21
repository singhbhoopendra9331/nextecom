"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { deletePost } from "@/actions/posts/delete-post";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/generated/prisma/browser";
import { toast } from "@/lib/toast";
import Image from "next/image";

type PostRow = Post & {
  slug: string;
  author?: { id: string; name: string | null } | null;
  featuredImage?: { url: string } | null;
  tags?: { name: string }[];
  categories?: { name: string }[];
};

function PostRowActions({ post }: { post: PostRow }) {
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
      cell: (row) => <Image src={row.featuredImage?.url ?? ""} alt={row.title} width={100} height={100} /> ?? "—",
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
      cell: (row) => <PostRowActions post={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={initialData.docs}
      getRowKey={(row) => row.id}
    />
  );
};

export default PostClient;
