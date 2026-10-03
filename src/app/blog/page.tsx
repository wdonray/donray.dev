import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | donray.dev",
  description:
    "Notes from Donray Williams on engineering management, frontend leadership, and shipping software.",
};

export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back home
      </Link>
      <div className="mt-8 space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Notes on engineering management, frontend leadership, and shipping
          software.
        </p>
      </div>
      <div className="mt-10 space-y-6">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">
              {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              Read post
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
