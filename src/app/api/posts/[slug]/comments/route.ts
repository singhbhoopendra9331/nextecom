import { PostStatus } from "@/generated/prisma/client";
import { getApprovedCommentsForPost } from "@/lib/comments/get-approved-comments";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await getApprovedCommentsForPost(post.id);

    return NextResponse.json({ docs: comments });
  } catch (error) {
    console.error("GET /api/posts/[slug]/comments", error);

    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
