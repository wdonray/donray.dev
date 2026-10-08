import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { getProject, PROJECTS } from "@/lib/projects";
import { getFaqJsonLd, serializeJsonLd } from "@/lib/schema";
import { LiveStats } from "@/components/live-stats";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const url = `/projects/${project.slug}`;
  const ogImage = project.screenshot ?? project.image;
  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: project.title,
      description: `${project.subtitle} ${project.description}`,
      url,
      type: "article",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: project.screenshotAlt ?? project.imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <article className="space-y-8">
        <header>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                Project · {project.role}
              </p>
              {project.status === "discontinued" && (
                <Badge variant="outline">Discontinued</Badge>
              )}
              {project.status === "maintenance" && (
                <Badge variant="outline">Maintenance mode</Badge>
              )}
              {!project.status && <Badge variant="outline">Live</Badge>}
              <h1 className="text-4xl font-bold tracking-tight">
                {project.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {project.subtitle}
              </p>
              <div
                className="flex flex-wrap gap-2"
                aria-label={`Technologies used in ${project.title}`}
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
                    Visit live site
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
                    View archived site
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
                    View on GitHub
                  </a>
                )}
              </div>
            </div>
            {project.image && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={project.image}
                  alt={project.imageAlt || project.title}
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
              alt={project.screenshotAlt || `${project.title} screenshot`}
              width={1600}
              height={973}
              className="w-full"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </figure>
        )}

        <div className="space-y-4">
          {project.details.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {project.features && project.features.length > 0 && (
          <section aria-labelledby="features-heading">
            <h2
              id="features-heading"
              className="text-2xl font-bold tracking-tight mb-4"
            >
              Features
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              {project.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </section>
        )}

        {slug === "hide-zero-cards" && (
          <LiveStats
            endpoint="/api/hzc-stats"
            sourceName="hidezerocards.org's"
            sourceHref="https://hidezerocards.org/analytics"
            external
          />
        )}
        {slug === "patternspell" && (
          <LiveStats
            endpoint="/api/ps-stats"
            sourceName="patternspell.org's"
            sourceHref="https://patternspell.org/analytics"
            external
          />
        )}
        {slug === "donray-dev" && (
          <LiveStats
            endpoint="/api/site-stats"
            sourceName="donray.dev's"
            sourceHref="/analytics"
          />
        )}

        {project.faq && project.faq.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight mb-4"
            >
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {project.faq.map((item, i) => (
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
                __html: serializeJsonLd(getFaqJsonLd(project.faq)),
              }}
            />
          </section>
        )}
      </article>
    </div>
  );
}
