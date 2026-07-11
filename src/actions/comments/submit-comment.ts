"use server";

import { CommentStatus, PostStatus } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth/session";
import { submitCommentSchema, type SubmitCommentInput } from "@/lib/comments/schemas";
import { getSubmissionRequestMeta } from "@/lib/forms/request-meta";
import { prisma } from "@/lib/prisma";
import {
  enforceRateLimit,
  rateLimitActionError,
} from "@/lib/rate-limit";
import type { SubmitCommentResult } from "@/types/comments";
import { revalidatePath } from "next/cache";

type Input = SubmitCommentInput & {
  source?: string | null;
};

export async function submitComment(input: Input): Promise<SubmitCommentResult> {
  try {
    const rateLimited = await enforceRateLimit("submit");
    if (rateLimited) {
      return rateLimitActionError(rateLimited);
    }

    const parsed = submitCommentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid comment data",
      };
    }

    if (parsed.data.website) {
      return {
        success: true,
        message: "Your comment has been submitted and is awaiting moderation.",
      };
    }

    const post = await prisma.post.findFirst({
      where: {
        id: parsed.data.postId,
        status: PostStatus.PUBLISHED,
      },
      select: { id: true, slug: true },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    if (parsed.data.parentId) {
      const parent = await prisma.comment.findFirst({
        where: {
          id: parsed.data.parentId,
          postId: post.id,
        },
        select: { id: true },
      });

      if (!parent) {
        return {
          success: false,
          error: "Parent comment not found",
        };
      }
    }

    const session = await getSession();
    const requestMeta = await getSubmissionRequestMeta(input.source);
    const authorUrl = parsed.data.authorUrl?.trim() || null;

    await prisma.comment.create({
      data: {
        postId: post.id,
        parentId: parsed.data.parentId ?? null,
        content: parsed.data.content,
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail,
        authorUrl,
        userId: session?.id ?? null,
        ipAddress: requestMeta.ip,
        userAgent: requestMeta.userAgent,
        status: CommentStatus.PENDING,
      },
    });

    revalidatePath(`/posts/${post.slug}`);
    revalidatePath("/admin/comments");

    return {
      success: true,
      message: "Your comment has been submitted and is awaiting moderation.",
    };
  } catch (error: unknown) {
    console.error("submitComment", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit comment",
    };
  }
}
