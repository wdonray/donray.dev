import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getPost,
  getPostContent,
  getMdxOptions,
  getHeadings,
  POSTS,
} from "@/lib/blog";
import { serializeJsonLd } from "@/lib/schema";
import TableOfContents from "@/components/table-of-contents";
import { mdxComponents } from "@/components/mdx-components";
import ViewCount from "@/components/view-count";

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
    title: `${post.title} | donray.dev`,
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

function faqPageJsonLd(post: NonNullable<ReturnType<typeof getPost>>) {
  if (post.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
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
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="text-primary underline">
          Back to blog
        </Link>
      </div>
    );
  }

  const mdxSource = getPostContent(slug);
  const mdxOptions = getMdxOptions();
  const headings = getHeadings(slug);
  const faqJsonLd = faqPageJsonLd(post);

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(blogPostingJsonLd(post)),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(faqJsonLd),
          }}
        />
      )}
      <article className="mt-8">
        <header className="space-y-4">
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingMinutes} min read
            </span>
            <ViewCount path={`/blog/${slug}`} />
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        </header>
        <TableOfContents headings={headings} />
        <div className="mt-4">
          <MDXRemote
            source={mdxSource}
            options={mdxOptions}
            components={mdxComponents}
          />
        </div>
      </article>
    </div>
  );
}
