"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { SectionHeader } from "@/components/ui/section-header";
import Image from "next/image";
import { itemVariants } from "@/lib/animations";
import { PROJECTS } from "@/lib/projects";

export interface Project {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  url?: string;
  /** Wayback Machine snapshot, used when the live site is gone. */
  archivedUrl?: string;
  github?: string;
  technologies: string[];
  image?: string;
  imageAlt?: string;
  note?: string;
  /** Omitted for active projects. */
  status?: "discontinued" | "maintenance";
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const t = useTranslations("home.projects");
  // Each action is an explicit visible link. No stretched invisible overlay:
  // a full-card link plus inner links creates redundant tab stops and
  // confusing screen-reader output.
  const primaryUrl = project.url ?? project.archivedUrl ?? project.github;
  const primaryKind = project.url
    ? "site"
    : project.archivedUrl
      ? "archived"
      : "github";
  const hasSecondaryGithub = Boolean(
    (project.url || project.archivedUrl) && project.github,
  );

  return (
    <motion.div
      key={`project-${index}-${project.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
      variants={itemVariants}
      role="listitem"
    >
      <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-khaki/10 hover:border-khaki/30 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-khaki/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold tracking-tight group-hover:text-khaki transition-colors">
                {project.title}
                {project.subtitle && (
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    {project.subtitle}
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {project.description}
              </CardDescription>
            </div>
            {project.image && (
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={project.image}
                  alt={project.imageAlt || project.title}
                  fill
                  className="object-cover"
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={t("technologies", { title: project.title })}
          >
            {project.technologies.map((tech, i) => (
              <Badge
                key={`tech-${i}-${tech.toLowerCase().replace(/\s+/g, "-")}`}
                variant="secondary"
                className="bg-muted/30"
                role="listitem"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
        {primaryUrl ? (
          <CardFooter className="flex items-center justify-between gap-2">
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-khaki transition-colors underline underline-offset-4 hover:opacity-80"
            >
              {primaryKind === "site" ? (
                <>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {t("visitSite")}
                </>
              ) : primaryKind === "archived" ? (
                <>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {t("archivedSite")}
                </>
              ) : (
                <>
                  <Github className="size-4" aria-hidden="true" />
                  {t("viewOnGitHub")}
                </>
              )}
            </a>
            {hasSecondaryGithub && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:text-khaki"
              >
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("viewOnGitHubLabel", { title: project.title })}
                >
                  <Github className="size-4" aria-hidden="true" />
                </a>
              </Button>
            )}
            <Link
              href={`/projects/${project.slug}`}
              aria-label={t("detailsLabel", { title: project.title })}
              className="inline-flex min-h-6 items-center text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              {t("details")}
            </Link>
          </CardFooter>
        ) : (
          <CardFooter className="flex items-center justify-end gap-2">
            <Link
              href={`/projects/${project.slug}`}
              aria-label={t("detailsLabel", { title: project.title })}
              className="inline-flex min-h-6 items-center text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              {t("details")}
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

export default function Projects() {
  const t = useTranslations("home.projects");
  const tp = useTranslations("projects");
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Display strings come from the locale catalog; structure from projects.ts.
  const projects: Project[] = PROJECTS.map((p) => ({
    slug: p.slug,
    title: tp(`${p.slug}.title`),
    subtitle: tp(`${p.slug}.subtitle`),
    description: tp(`${p.slug}.description`),
    url: p.url,
    archivedUrl: p.archivedUrl,
    github: p.github,
    technologies: p.stack,
    image: p.image,
    imageAlt: p.image ? tp(`${p.slug}.imageAlt`) : undefined,
    status: p.status,
  }));

  const activeProjects = projects.filter((project) => !project.status);
  const pastProjects = projects.filter((project) => project.status);

  return (
    <section id="projects" aria-labelledby="projects-heading" ref={sectionRef}>
      <div className="space-y-8">
        <SectionHeader
          id="projects-heading"
          title={t("title")}
          isInView={isInView}
        />
        <div
          className="grid gap-6 md:grid-cols-2"
          role="list"
          aria-label={t("active")}
        >
          {activeProjects.map((project, index) => (
            <ProjectCard
              key={`project-${index}-${project.title
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              project={project}
              index={index}
            />
          ))}
        </div>
        {pastProjects.length > 0 && (
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold tracking-tight">{t("past")}</h3>
            <div
              className="grid gap-6 md:grid-cols-2"
              role="list"
              aria-label={t("past")}
            >
              {pastProjects.map((project, index) => (
                <ProjectCard
                  key={`past-project-${index}-${project.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  project={project}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
