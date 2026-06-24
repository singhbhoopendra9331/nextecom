import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getBlogPagePath } from "@/lib/posts/get-published-posts";

import { BlogsListing, buildBlogsMetadata } from "../../blogs-listing";

type Args = {
  params: Promise<{
    "page-number": string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function PaginatedBlogsPage({
  params,
  searchParams,
}: Args) {
  const { "page-number": pageNumber } = await params;
  const page = Number(pageNumber);

  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  const { search = "" } = await searchParams;
  const trimmedSearch = search.trim();

  if (page === 1) {
    redirect(getBlogPagePath(1, trimmedSearch));
  }

  return <BlogsListing page={page} searchParams={searchParams} />;
}

export async function generateMetadata({
  params,
  searchParams,
}: Args): Promise<Metadata> {
  const { "page-number": pageNumber } = await params;
  const page = Number(pageNumber);
  const { search = "" } = await searchParams;

  if (!Number.isInteger(page) || page < 1) {
    return { title: "Blog" };
  }

  return buildBlogsMetadata(page, search.trim());
}
