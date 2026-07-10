import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import RenderBlocks from "@/components/frontend/render-blocks";
import type { RelatedPostSummary } from "@/lib/posts/get-related-posts";

type PostClientProps = {
  post: {
    title: string;
    content: unknown;
    createdAt: string | Date;
    author?: { id: string; name: string | null } | null;
    featuredImage?: {
      url: string;
      originalName: string;
    } | null;
    tags?: { name: string }[];
    categories?: { name: string }[];
    relatedPosts?: RelatedPostSummary[];
  };
};

export default function PostClient({ post }: PostClientProps) {
  const createdAt = new Date(post.createdAt);

  return (
    <article className="container mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/posts"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to posts
      </Link>

      <header className="mb-8">
        <time
          dateTime={createdAt.toISOString()}
          className="text-sm text-muted-foreground"
        >
          {format(createdAt, "MMMM d, yyyy")}
        </time>

        <h1 className="mt-2 text-4xl font-bold leading-tight">{post.title}</h1>

        {post.author?.name ? (
          <p className="mt-3 text-muted-foreground">By {post.author.name}</p>
        ) : null}

        {post.categories && post.categories.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {post.categories.map((category) => category.name).join(", ")}
          </p>
        ) : null}

        {post.tags && post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {post.featuredImage?.url ? (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.originalName}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <RenderBlocks content={post.content} />

      {post.relatedPosts && post.relatedPosts.length > 0 ? (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold">Related Posts</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.id}
                className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
              >
                <Link href={`/posts/${relatedPost.slug}`} className="block">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {relatedPost.featuredImage?.url ? (
                      <Image
                        src={relatedPost.featuredImage.url}
                        alt={relatedPost.featuredImage.originalName}
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
                      dateTime={new Date(relatedPost.createdAt).toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {format(new Date(relatedPost.createdAt), "MMM d, yyyy")}
                    </time>

                    <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:underline">
                      {relatedPost.title}
                    </h3>

                    {relatedPost.author?.name ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        By {relatedPost.author.name}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
