import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { getProject, PROJECTS } from "@/lib/projects";
import { getFaqJsonLd, serializeJsonLd } from "@/lib/schema";
import { LiveStats } from "@/components/live-stats";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

interface PageParams {
  locale: string;
  slug: string;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PROJECTS.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};
  const project = getProject(slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: "projects" });
  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);
  const url = `/projects/${project.slug}`;
  const alternates = localeAlternates(url, locale);
  const ogImage = project.screenshot ?? project.image;
  const imageAlt =
    (project.screenshot
      ? t(`${slug}.screenshotAlt`)
      : project.image
        ? t(`${slug}.imageAlt`)
        : undefined) || title;
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description: `${t(`${slug}.subtitle`)} ${description}`,
      url: alternates.canonical,
      type: "article",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("projects");
  const tc = await getTranslations("projectPage");

  const title = t(`${slug}.title`);
  const details = t.raw(`${slug}.details`) as string[];
  const features = t.raw(`${slug}.features`) as string[] | undefined;
  const faq = t.raw(`${slug}.faq`) as
    | { question: string; answer: string }[]
    | undefined;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <article className="space-y-8">
        <header>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                {tc("project")} · {t(`${slug}.role`)}
              </p>
              {project.status === "discontinued" && (
                <Badge variant="outline">{tc("discontinued")}</Badge>
              )}
              {project.status === "maintenance" && (
                <Badge variant="outline">{tc("maintenance")}</Badge>
              )}
              {!project.status && <Badge variant="outline">{tc("live")}</Badge>}
              <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
              <p className="text-lg text-muted-foreground">
                {t(`${slug}.subtitle`)}
              </p>
              <div
                className="flex flex-wrap gap-2"
                aria-label={tc("technologies", { title })}
              >
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {tc("visitLiveSite")}
                  </a>
                )}
                {project.archivedUrl && (
                  <a
                    href={project.archivedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {tc("viewArchivedSite")}
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    <Github className="size-4" aria-hidden="true" />
                    {tc("viewOnGitHub")}
                  </a>
                )}
              </div>
            </div>
            {project.image && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={project.image}
                  alt={t(`${slug}.imageAlt`) || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                />
              </div>
            )}
          </div>
        </header>

        {project.screenshot && (
          <figure className="overflow-hidden rounded-xl border shadow-sm">
            <Image
              src={project.screenshot}
              alt={t(`${slug}.screenshotAlt`) || tc("screenshotAlt", { title })}
              width={1600}
              height={973}
              className="w-full"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </figure>
        )}

        <div className="space-y-4">
          {details.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {features && features.length > 0 && (
          <section aria-labelledby="features-heading">
            <h2
              id="features-heading"
              className="text-2xl font-bold tracking-tight mb-4"
            >
              {tc("features")}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </section>
        )}

        {slug === "hide-zero-cards" && (
          <LiveStats
            endpoint="/api/hzc-stats"
            sourceName="hidezerocards.org"
            sourceHref="https://hidezerocards.org/analytics"
            external
          />
        )}
        {slug === "patternspell" && (
          <LiveStats endpoint="/api/ps-stats" sourceName="patternspell.org" />
        )}
        {slug === "donray-dev" && (
          <LiveStats
            endpoint="/api/site-stats"
            sourceName="donray.dev"
            sourceHref="/analytics"
          />
        )}

        {faq && faq.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight mb-4"
            >
              {tc("faq")}
            </h2>
            <div className="space-y-6">
              {faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-muted-foreground leading-relaxed mt-1">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: serializeJsonLd(getFaqJsonLd(faq)),
              }}
            />
          </section>
        )}
      </article>
    </div>
  );
}
