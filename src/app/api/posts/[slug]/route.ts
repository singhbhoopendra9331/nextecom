import { PostStatus } from "@/generated/prisma/client";
import { getRelatedPosts } from "@/lib/posts/get-related-posts";
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
      include: {
        author: {
          select: { id: true, name: true },
        },
        featuredImage: {
          select: { id: true, url: true, originalName: true },
        },
        tags: {
          select: { name: true },
        },
        categories: {
          select: { name: true },
        },
        meta: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const relatedPosts = await getRelatedPosts(post.meta, {
      currentPostId: post.id,
    });

    return NextResponse.json({
      ...post,
      relatedPosts,
    });
  } catch (error) {
    console.error("GET /api/posts/[slug]:", error);

    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
