import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { POSTS } from "@/lib/blog";
import ViewCount from "@/components/view-count";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "blog" });
  const alternates = localeAlternates("/blog", locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const activeLocale = await getLocale();

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <p className="text-sm text-muted-foreground italic">
          {t("englishOnly")}
        </p>
      </div>
      <div className="mt-10 space-y-6">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {new Date(post.date + "T12:00:00").toLocaleDateString(
                  activeLocale,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}{" "}
                · {t("readingTime", { minutes: post.readingMinutes })}
              </span>
              <ViewCount path={`/blog/${post.slug}`} />
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
              {t("readPost")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
