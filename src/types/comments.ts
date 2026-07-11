import type { CommentStatus } from "@/generated/prisma/browser";

export type PublicComment = {
  id: string;
  content: string;
  authorName: string;
  authorUrl: string | null;
  createdAt: string;
  replies: PublicCommentReply[];
};

export type PublicCommentReply = {
  id: string;
  content: string;
  authorName: string;
  authorUrl: string | null;
  createdAt: string;
};

export type AdminCommentRow = {
  id: string;
  content: string;
  status: CommentStatus;
  authorName: string;
  authorEmail: string;
  authorUrl: string | null;
  postId: string;
  parentId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  post: {
    title: string;
    slug: string;
  };
  _count: {
    replies: number;
  };
};

export type SubmitCommentResult =
  | {
    success: true;
    message: string;
  }
  | {
    success: false;
    error: string;
  };
