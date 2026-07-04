import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getGlobalSettings } from "@/lib/settings";
import { getPublishedPosts } from "@/lib/posts/get-published-posts";

import BlogsPageClient from "./page.client";

type BlogsListingProps = {
  page: number;
  searchParams: Promise<{
    search?: string;
  }>;
};

export async function buildBlogsMetadata(
  page: number,
  search: string
): Promise<Metadata> {
  const settings = await getGlobalSettings();

  let title = "Blog";

  if (search) {
    title = `Search: ${search}`;
  } else if (page > 1) {
    title = `Blog - Page ${page}`;
  }

  return {
    title: `${title} | ${settings.siteTitle}`,
    description: settings.siteTagline || undefined,
  };
}

export async function BlogsListing({ page, searchParams }: BlogsListingProps) {
  const { search = "" } = await searchParams;
  const trimmedSearch = search.trim();
  const data = await getPublishedPosts({
    page,
    search: trimmedSearch,
  });

  if (page < 1 || !Number.isInteger(page)) {
    notFound();
  }

  if (data.pagination.total > 0 && page > data.pagination.pages) {
    notFound();
  }

  return (
    <BlogsPageClient
      posts={data.docs}
      pagination={{
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total,
      }}
      search={trimmedSearch}
    />
  );
}
