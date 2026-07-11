import { CommentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PublicComment } from "@/types/comments";

const commentSelect = {
  id: true,
  content: true,
  authorName: true,
  authorUrl: true,
  createdAt: true,
  replies: {
    where: { status: CommentStatus.APPROVED },
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      content: true,
      authorName: true,
      authorUrl: true,
      createdAt: true,
    },
  },
} as const;

export async function getApprovedCommentsForPost(
  postId: string
): Promise<PublicComment[]> {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      status: CommentStatus.APPROVED,
      parentId: null,
    },
    orderBy: { createdAt: "asc" },
    select: commentSelect,
  });

  return comments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    replies: comment.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  }));
}
