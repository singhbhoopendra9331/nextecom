import { LogLevel, PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ApplicationStats = {
  users: number;
  posts: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  pages: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  media: number;
  categories: number;
  tags: number;
  logs: {
    total: number;
    error: number;
    warn: number;
  };
  recentErrors: {
    id: string;
    message: string;
    source: string | null;
    createdAt: Date;
  }[];
};

export async function getApplicationStats(): Promise<ApplicationStats> {
  const [
    users,
    postsTotal,
    postsPublished,
    postsDraft,
    postsArchived,
    pagesTotal,
    pagesPublished,
    pagesDraft,
    pagesArchived,
    media,
    categories,
    tags,
    logsTotal,
    logsError,
    logsWarn,
    recentErrors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } }),
    prisma.post.count({ where: { status: PostStatus.ARCHIVED } }),
    prisma.page.count(),
    prisma.page.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.page.count({ where: { status: PostStatus.DRAFT } }),
    prisma.page.count({ where: { status: PostStatus.ARCHIVED } }),
    prisma.media.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.applicationLog.count(),
    prisma.applicationLog.count({ where: { level: LogLevel.ERROR } }),
    prisma.applicationLog.count({ where: { level: LogLevel.WARN } }),
    prisma.applicationLog.findMany({
      where: { level: LogLevel.ERROR },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        message: true,
        source: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users,
    posts: {
      total: postsTotal,
      published: postsPublished,
      draft: postsDraft,
      archived: postsArchived,
    },
    pages: {
      total: pagesTotal,
      published: pagesPublished,
      draft: pagesDraft,
      archived: pagesArchived,
    },
    media,
    categories,
    tags,
    logs: { total: logsTotal, error: logsError, warn: logsWarn },
    recentErrors,
  };
}
