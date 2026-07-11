"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { MessageSquare, Reply } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { submitComment } from "@/actions/comments/submit-comment";
import { EmailField, TextField, TextareaField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { commentFieldsSchema } from "@/lib/comments/schemas";
import { toast } from "@/lib/toast";
import type { PublicComment } from "@/types/comments";

type CommentFormValues = {
  authorName: string;
  authorEmail: string;
  content: string;
};

type PostCommentsProps = {
  postId: string;
  postSlug: string;
  initialComments: PublicComment[];
};

function CommentForm({
  postId,
  parentId = null,
  onCancel,
  onSuccess,
  compact = false,
}: {
  postId: string;
  parentId?: string | null;
  onCancel?: () => void;
  onSuccess: () => void;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo<CommentFormValues>(
    () => ({
      authorName: "",
      authorEmail: "",
      content: "",
    }),
    [],
  );

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFieldsSchema),
    defaultValues,
  });

  function onSubmit(values: CommentFormValues) {
    startTransition(async () => {
      const result = await submitComment({
        ...values,
        postId,
        parentId,
        source:
          typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to submit comment");
        return;
      }

      toast.success(result.message);
      form.reset(defaultValues);
      onSuccess();
    });
  }

  return (
    <form
      className={
        compact ? "space-y-3 rounded-md border bg-muted/30 p-4" : "space-y-4"
      }
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Name"
          required
          autoComplete="name"
          control={form.control}
          name="authorName"
        />
        <EmailField
          label="Email"
          required
          autoComplete="email"
          control={form.control}
          name="authorEmail"
        />
      </div>

      <TextareaField
        label={parentId ? "Reply" : "Comment"}
        required
        rows={compact ? 4 : 5}
        control={form.control}
        name="content"
      />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Submitting..."
            : parentId
              ? "Post Reply"
              : "Post Comment"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  postId,
  onChanged,
}: {
  comment: PublicComment;
  postId: string;
  onChanged: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const createdAt = new Date(comment.createdAt);

  return (
    <article id={`comment-${comment.id}`} className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            {comment.authorUrl ? (
              <a
                href={comment.authorUrl}
                className="font-medium hover:underline"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                {comment.authorName}
              </a>
            ) : (
              <p className="font-medium">{comment.authorName}</p>
            )}
            <time
              dateTime={createdAt.toISOString()}
              className="text-xs text-muted-foreground"
            >
              {format(createdAt, "MMMM d, yyyy 'at' h:mm a")}
            </time>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReplyOpen((open) => !open)}
          >
            <Reply className="size-4" />
            Reply
          </Button>
        </header>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
          {comment.content}
        </p>
      </div>

      {replyOpen ? (
        <div className="ml-4 sm:ml-8">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            compact
            onCancel={() => setReplyOpen(false)}
            onSuccess={() => {
              setReplyOpen(false);
              onChanged();
            }}
          />
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="ml-4 space-y-4 border-l pl-4 sm:ml-8 sm:pl-6">
          {comment.replies.map((reply) => {
            const replyDate = new Date(reply.createdAt);

            return (
              <article
                key={reply.id}
                id={`comment-${reply.id}`}
                className="rounded-lg border bg-muted/20 p-4"
              >
                <header>
                  {reply.authorUrl ? (
                    <a
                      href={reply.authorUrl}
                      className="font-medium hover:underline"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                    >
                      {reply.authorName}
                    </a>
                  ) : (
                    <p className="font-medium">{reply.authorName}</p>
                  )}
                  <time
                    dateTime={replyDate.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {format(replyDate, "MMMM d, yyyy 'at' h:mm a")}
                  </time>
                </header>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {reply.content}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

export default function PostComments({
  postId,
  postSlug,
  initialComments,
}: PostCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [isRefreshing, startRefresh] = useTransition();

  function refreshComments() {
    startRefresh(async () => {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { docs: PublicComment[] };
      setComments(data.docs);
    });
  }

  return (
    <section className="mt-12 border-t pt-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="size-5" />
        <h2 className="text-2xl font-semibold">
          Comments{comments.length > 0 ? ` (${comments.length})` : ""}
        </h2>
      </div>

      <div className="mb-8">
        <CommentForm postId={postId} onSuccess={refreshComments} />
      </div>

      {isRefreshing ? (
        <p className="text-sm text-muted-foreground">Refreshing comments...</p>
      ) : null}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onChanged={refreshComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
