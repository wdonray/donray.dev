import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPost, POSTS } from "@/lib/blog";
import { serializeJsonLd } from "@/lib/schema";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — donray.dev`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.donray.dev/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function blogPostingJsonLd(post: NonNullable<ReturnType<typeof getPost>>) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Donray Williams",
      url: "https://www.donray.dev",
    },
    url: `https://www.donray.dev/blog/${post.slug}`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="text-primary underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(blogPostingJsonLd(post)),
        }}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All posts
      </Link>
      <article className="mt-8">
        <header className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        </header>
        <div className="mt-8 space-y-5">
          {post.content.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
