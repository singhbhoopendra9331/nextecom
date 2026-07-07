import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  buildHomePageMetadata,
  getHomePage,
} from "@/lib/pages/get-home-page";

import PageClient from "./[slug]/page.client";

export async function generateMetadata(): Promise<Metadata> {
  return buildHomePageMetadata();
}

export default async function HomePage() {
  const page = await getHomePage();

  if (!page) {
    notFound();
  }

  return (
    <PageClient
      page={{
        title: page.title,
        content: page.content,
        featuredImage: page.featuredImage,
      }}
    />
  );
}
