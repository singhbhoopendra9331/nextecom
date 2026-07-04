import type { Metadata } from "next";

import { BlogsListing, buildBlogsMetadata } from "./blogs-listing";

type Args = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function BlogsPage({ searchParams }: Args) {
  return <BlogsListing page={1} searchParams={searchParams} />;
}

export async function generateMetadata({
  searchParams,
}: Args): Promise<Metadata> {
  const { search = "" } = await searchParams;

  return buildBlogsMetadata(1, search.trim());
}
