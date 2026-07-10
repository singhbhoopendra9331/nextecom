import type { Metadata } from "next";
import { AxiosError } from "axios";
import { notFound } from "next/navigation";

import { axios } from "@/lib/axios";
import { resolveSeoDescription, resolveSeoTitle } from "@/lib/meta/seo";
import type { RelatedPostSummary } from "@/lib/posts/get-related-posts";
import { getGlobalSettings } from "@/lib/settings";

import PostClient from "./page.client";

type PostRecord = {
  title: string;
  content: unknown;
  createdAt: string | Date;
  author?: { id: string; name: string | null } | null;
  featuredImage?: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  tags?: { name: string }[];
  categories?: { name: string }[];
  meta: { key: string; value: string }[];
  relatedPosts?: RelatedPostSummary[];
};

async function getPostBySlug(slug: string): Promise<PostRecord | null> {
  try {
    const response = await axios.get<PostRecord>(`/api/posts/${slug}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

async function buildMetadata(post: PostRecord | null): Promise<Metadata> {
  const globalSettings = await getGlobalSettings();

  if (!post) {
    return {
      title: globalSettings.siteTitle,
      description: globalSettings.siteTagline || undefined,
    };
  }

  const description = resolveSeoDescription(
    post.meta,
    globalSettings.siteTagline
  );

  return {
    title: resolveSeoTitle(
      post.meta,
      `${post.title} | ${globalSettings.siteTitle}`
    ),
    description: description || undefined,
    openGraph: post.featuredImage?.url
      ? { images: [{ url: post.featuredImage.url }] }
      : undefined,
  };
}

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostPage({ params }: Args) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <PostClient
      post={{
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        author: post.author,
        featuredImage: post.featuredImage,
        tags: post.tags,
        categories: post.categories,
        relatedPosts: post.relatedPosts ?? [],
      }}
    />
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return buildMetadata(post);
}
