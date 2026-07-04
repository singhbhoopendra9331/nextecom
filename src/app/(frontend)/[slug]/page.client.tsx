"use client";

import Image from "next/image";

import RenderBlocks from "@/components/frontend/render-blocks";

type PageClientProps = {
  page: {
    title: string;
    content: unknown;
    featuredImage?: {
      url: string;
      originalName: string;
    } | null;
  };
};

export default function PageClient({ page }: PageClientProps) {
  return (
    <article className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold">{page.title}</h1>

      {page.featuredImage?.url ? (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={page.featuredImage.url}
            alt={page.featuredImage.originalName}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <RenderBlocks content={page.content} />
    </article>
  );
}
