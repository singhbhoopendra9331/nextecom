import { format } from "date-fns";
import {
  AlertTriangle,
  FileText,
  FolderTree,
  ImageIcon,
  ScrollText,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApplicationStats } from "@/lib/dashboard-stats";
import { PageTitle } from "@/components/page-title";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;
};

function StatCard({ title, value, description, href, icon: Icon }: StatCardProps) {
  return (
    <Link href={href} className="block transition-opacity hover:opacity-90 mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

type ContentBreakdownProps = {
  title: string;
  href: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
};

function ContentBreakdown({
  title,
  href,
  total,
  published,
  draft,
  archived,
}: ContentBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{total} total</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="default">{published} published</Badge>
        <Badge variant="secondary">{draft} draft</Badge>
        {archived > 0 ? (
          <Badge variant="outline">{archived} archived</Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

function truncateMessage(message: string, max = 80) {
  return message.length > max ? `${message.slice(0, max)}…` : message;
}

export default async function AdminDashboardPage() {
  const stats = await getApplicationStats();

  return (
    <div className="min-h-screen p-2 md:p-4">
      <PageTitle title="Dashboard" description="Application overview and key metrics"/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={stats.users}
          description="Registered accounts"
          href="/admin/users"
          icon={Users}
        />
        <StatCard
          title="Posts"
          value={stats.posts.total}
          description={`${stats.posts.published} published, ${stats.posts.draft} draft`}
          href="/admin/posts"
          icon={FileText}
        />
        <StatCard
          title="Pages"
          value={stats.pages.total}
          description={`${stats.pages.published} published, ${stats.pages.draft} draft`}
          href="/admin/pages"
          icon={ScrollText}
        />
        <StatCard
          title="Media"
          value={stats.media}
          description="Files in media library"
          href="/admin/media"
          icon={ImageIcon}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-4">
        <ContentBreakdown
          title="Posts"
          href="/admin/posts"
          total={stats.posts.total}
          published={stats.posts.published}
          draft={stats.posts.draft}
          archived={stats.posts.archived}
        />
        <ContentBreakdown
          title="Pages"
          href="/admin/pages"
          total={stats.pages.total}
          published={stats.pages.published}
          draft={stats.pages.draft}
          archived={stats.pages.archived}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/admin/logs" className="hover:underline">
                Application Logs
              </Link>
            </CardTitle>
            <CardDescription>{stats.logs.total} total entries</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="destructive">{stats.logs.error} errors</Badge>
            <Badge variant="secondary">{stats.logs.warn} warnings</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxonomy</CardTitle>
            <CardDescription>Content organization</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FolderTree className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Tag className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tags</p>
                <p className="text-2xl font-bold">{stats.tags}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Recent Errors
            </CardTitle>
            <CardDescription>
              Latest application errors from the log
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No errors recorded.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentErrors.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <p className="font-medium">
                      {truncateMessage(log.message)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(log.createdAt, "MMM d, yyyy HH:mm")}</span>
                      {log.source ? (
                        <>
                          <span>·</span>
                          <span>{log.source}</span>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/logs"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              View all logs
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
