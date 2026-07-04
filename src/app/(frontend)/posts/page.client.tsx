"use client";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBlogPagePath } from "@/lib/posts/blog-paths";

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  createdAt: string | Date;
  author?: { id: string; name: string | null } | null;
  featuredImage?: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  tags?: { name: string }[];
  categories?: { name: string }[];
};

type BlogsPageClientProps = {
  posts: BlogPostCard[];
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
  search: string;
};

function BlogPagination({
  pagination,
  search,
}: {
  pagination: BlogsPageClientProps["pagination"];
  search: string;
}) {
  const { page, pages } = pagination;

  if (pages <= 1) {
    return null;
  }

  const delta = 2;
  const pageNumbers: number[] = [];
  const start = Math.max(1, page - delta);
  const end = Math.min(pages, page + delta);

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  const linkClass = (active: boolean) =>
    `rounded-md border px-3 py-1 text-sm transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "hover:bg-muted"
    }`;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={getBlogPagePath(1, search)}
          aria-disabled={page === 1}
          className={`rounded-md border p-2 ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          <ChevronsLeft size={16} />
        </Link>

        <Link
          href={getBlogPagePath(page - 1, search)}
          aria-disabled={page === 1}
          className={`rounded-md border p-2 ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          <ChevronLeft size={16} />
        </Link>

        {pageNumbers.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={getBlogPagePath(pageNumber, search)}
            className={linkClass(pageNumber === page)}
          >
            {pageNumber}
          </Link>
        ))}

        <Link
          href={getBlogPagePath(page + 1, search)}
          aria-disabled={page === pages}
          className={`rounded-md border p-2 ${page === pages ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          <ChevronRight size={16} />
        </Link>

        <Link
          href={getBlogPagePath(pages, search)}
          aria-disabled={page === pages}
          className={`rounded-md border p-2 ${page === pages ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          <ChevronsRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function BlogsPageClient({
  posts,
  pagination,
  search,
}: BlogsPageClientProps) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Posts</h1>
          <p className="mt-2 text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "post" : "posts"}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>

        <form action="/posts" method="GET" className="flex w-full max-w-md gap-2">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search posts..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No posts found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Check back later for new articles."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {post.featuredImage?.url ? (
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.originalName}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <time
                    dateTime={new Date(post.createdAt).toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </time>

                  <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:underline">
                    {post.title}
                  </h2>

                  {post.author?.name ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      By {post.author.name}
                    </p>
                  ) : null}

                  {post.categories && post.categories.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {post.categories.map((category) => category.name).join(", ")}
                    </p>
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      <BlogPagination pagination={pagination} search={search} />
    </div>
  );
}
