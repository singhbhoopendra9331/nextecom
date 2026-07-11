import { PageTitle } from "@/components/page-title";
import { createAdminMetadata } from "@/lib/admin/metadata";
import { prisma } from "@/lib/prisma";

import CommentsPageClient from "./page.client";

export const metadata = createAdminMetadata(
  "Comments",
  "Manage post comments.",
);

export default async function Page() {
  const page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        status: true,
        authorName: true,
        authorEmail: true,
        authorUrl: true,
        postId: true,
        parentId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    }),
    prisma.comment.count(),
  ]);

  const initialData = {
    docs: comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  return (
    <div className="min-h-screen space-y-6 p-2 md:p-4">
      <PageTitle title="Comments" description="Manage your comments" />
      <CommentsPageClient initialData={initialData} />
    </div>
  );
}
