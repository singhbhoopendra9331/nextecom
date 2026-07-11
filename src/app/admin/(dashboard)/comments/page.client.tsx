"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { Check, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteComment } from "@/actions/comments/delete-comment";
import { updateCommentStatus } from "@/actions/comments/update-comment-status";
import { AppSheet } from "@/components/app-sheet";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommentStatus } from "@/generated/prisma/browser";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";
import type { AdminCommentRow } from "@/types/comments";

function statusVariant(status: CommentStatus) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "SPAM":
      return "destructive";
    case "TRASH":
      return "outline";
    default:
      return "secondary";
  }
}

function truncateContent(content: string, max = 80) {
  const normalized = content.trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max)}…`;
}

function CommentDetail({
  comment,
  onChanged,
  onClose,
}: {
  comment: AdminCommentRow;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleStatus(status: CommentStatus) {
    setIsUpdating(true);

    const result = await updateCommentStatus({ id: comment.id, status });

    setIsUpdating(false);

    if (result.success) {
      toast.success(`Comment marked as ${status.toLowerCase()}`);
      onChanged();
      onClose();
      return;
    }

    toast.error(result.error ?? "Failed to update comment");
  }

  async function handleDelete() {
    if (!confirm("Delete this comment permanently?")) {
      return;
    }

    setIsDeleting(true);

    const result = await deleteComment(comment.id);

    setIsDeleting(false);

    if (result.success) {
      toast.success("Comment deleted");
      onChanged();
      onClose();
      return;
    }

    toast.error(result.error ?? "Failed to delete comment");
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">Author</dt>
          <dd>
            {comment.authorName} ({comment.authorEmail})
          </dd>
        </div>
        {comment.authorUrl ? (
          <div>
            <dt className="font-medium text-muted-foreground">Website</dt>
            <dd className="break-all">{comment.authorUrl}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-muted-foreground">Post</dt>
          <dd>
            <Link className="link" href={`/posts/${comment.post.slug}`} target="_blank">
              {comment.post.title}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={statusVariant(comment.status)}>
              {comment.status.toLowerCase()}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Submitted</dt>
          <dd>{format(new Date(comment.createdAt), "PPpp")}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">IP</dt>
          <dd>{comment.ipAddress ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">User Agent</dt>
          <dd className="break-all">{comment.userAgent ?? "—"}</dd>
        </div>
        {comment.parentId ? (
          <div>
            <dt className="font-medium text-muted-foreground">Reply to</dt>
            <dd className="font-mono text-xs">{comment.parentId}</dd>
          </div>
        ) : null}
        {comment._count.replies > 0 ? (
          <div>
            <dt className="font-medium text-muted-foreground">Replies</dt>
            <dd>{comment._count.replies}</dd>
          </div>
        ) : null}
      </dl>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Comment</h3>
        <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {comment.status !== "APPROVED" ? (
          <Button
            size="sm"
            disabled={isUpdating || isDeleting}
            onClick={() => handleStatus("APPROVED")}
          >
            <Check className="size-4" />
            Approve
          </Button>
        ) : null}
        {comment.status !== "SPAM" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating || isDeleting}
            onClick={() => handleStatus("SPAM")}
          >
            Mark Spam
          </Button>
        ) : null}
        {comment.status !== "TRASH" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating || isDeleting}
            onClick={() => handleStatus("TRASH")}
          >
            Move to Trash
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="destructive"
          disabled={isUpdating || isDeleting}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}

function CommentRowActions({
  comment,
  onView,
  onChanged,
}: {
  comment: AdminCommentRow;
  onView: (comment: AdminCommentRow) => void;
  onChanged: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatus(status: CommentStatus) {
    setIsUpdating(true);

    const result = await updateCommentStatus({ id: comment.id, status });

    setIsUpdating(false);

    if (result.success) {
      toast.success(`Comment marked as ${status.toLowerCase()}`);
      onChanged();
      return;
    }

    toast.error(result.error ?? "Failed to update comment");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(comment)}>View</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/posts/${comment.post.slug}#comment-${comment.id}`} target="_blank">
            <ExternalLink className="size-4" />
            View on site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {comment.status !== "APPROVED" ? (
          <DropdownMenuItem onClick={() => handleStatus("APPROVED")}>
            Approve
          </DropdownMenuItem>
        ) : null}
        {comment.status !== "SPAM" ? (
          <DropdownMenuItem onClick={() => handleStatus("SPAM")}>
            Mark Spam
          </DropdownMenuItem>
        ) : null}
        {comment.status !== "TRASH" ? (
          <DropdownMenuItem onClick={() => handleStatus("TRASH")}>
            Move to Trash
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CommentsPageClient({
  initialData,
}: {
  initialData: {
    docs: AdminCommentRow[];
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
  const [status, setStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [selectedComment, setSelectedComment] = useState<AdminCommentRow | null>(
    null
  );
  const skipSearchEffect = useRef(true);

  const fetchComments = useCallback(
    (page: number, searchTerm: string, statusFilter: string) => {
      startTransition(async () => {
        const response = await axios.get("/api/comments", {
          params: {
            page,
            limit: data.pagination.limit,
            search: searchTerm.trim(),
            ...(statusFilter !== "all" ? { status: statusFilter } : {}),
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
      fetchComments(1, search, status);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, status, fetchComments]);

  const columns: DataTableColumn<AdminCommentRow>[] = [
    {
      id: "author",
      header: "Author",
      cell: (row) => (
        <button
          type="button"
          className="link text-left"
          onClick={() => setSelectedComment(row)}
        >
          <span className="block font-medium">{row.authorName}</span>
          <span className="text-xs text-muted-foreground">{row.authorEmail}</span>
        </button>
      ),
    },
    {
      id: "content",
      header: "Comment",
      cell: (row) => (
        <span className="line-clamp-2 max-w-[320px] text-sm">
          {truncateContent(row.content)}
        </span>
      ),
    },
    {
      id: "post",
      header: "Post",
      cell: (row) => (
        <Link className="link line-clamp-2 max-w-[200px]" href={`/posts/${row.post.slug}`} target="_blank">
          {row.post.title}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>{row.status.toLowerCase()}</Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: (row) => format(new Date(row.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <CommentRowActions
          comment={row}
          onView={setSelectedComment}
          onChanged={() => fetchComments(data.pagination.page, search, status)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            fetchComments(1, search, value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="SPAM">Spam</SelectItem>
            <SelectItem value="TRASH">Trash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        showHeader={false}
        columns={columns}
        data={data.docs}
        getRowKey={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search comments..."
        isLoading={isPending}
        pagination={data.pagination}
        onPageChange={(page) => fetchComments(page, search, status)}
        emptyMessage={
          search.trim() || status !== "all"
            ? "No comments match your filters."
            : "No comments yet."
        }
      />

      <AppSheet
        open={Boolean(selectedComment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedComment(null);
          }
        }}
        title="Comment Details"
        width="w-[560px]"
      >
        {selectedComment ? (
          <CommentDetail
            comment={selectedComment}
            onChanged={() => fetchComments(data.pagination.page, search, status)}
            onClose={() => setSelectedComment(null)}
          />
        ) : null}
      </AppSheet>
    </>
  );
}
