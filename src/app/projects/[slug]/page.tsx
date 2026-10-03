import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { getProject, PROJECTS } from "@/lib/projects";

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
  return {
    title: `${project.title} | donray.dev`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `https://www.donray.dev/projects/${project.slug}`,
      type: "article",
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
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-12">
      <article className="space-y-8">
        <header>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                Project · {project.role}
              </p>
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

        <div className="space-y-4">
          {project.details.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
