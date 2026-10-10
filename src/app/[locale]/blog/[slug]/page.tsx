import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
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
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    POSTS.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};
  const post = getPost(slug);
  if (!post) return {};
  const alternates = localeAlternates(`/blog/${post.slug}`, locale);
  return {
    title: post.title,
    description: post.excerpt,
    alternates,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: alternates.canonical,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const activeLocale = await getLocale();
  const post = getPost(slug);
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold">{t("postNotFound")}</h1>
        <Link href="/blog" className="text-primary underline">
          {t("backToBlog")}
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
      <p className="text-sm text-muted-foreground italic">{t("englishOnly")}</p>
      <article className="mt-8">
        <header className="space-y-4">
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {new Date(post.date + "T12:00:00").toLocaleDateString(
                activeLocale,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("readingTime", { minutes: post.readingMinutes })}
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
