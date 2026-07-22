"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
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

interface Project {
  title: string;
  subtitle?: string;
  description: string;
  url?: string;
  github?: string;
  technologies: string[];
  image?: string;
  imageAlt?: string;
  note?: string;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  // The whole card is a single tap target pointing at the primary destination
  // (site URL, or GitHub when there's no site). A secondary GitHub control sits
  // above the stretched overlay link via z-index so it stays independently
  // clickable without nesting anchors.
  const primaryUrl = project.url ?? project.github;
  const primaryIsSite = Boolean(project.url);
  const hasSecondaryGithub = Boolean(project.url && project.github);

  return (
    <motion.div
      key={`project-${index}-${project.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
      variants={itemVariants}
      role="listitem"
    >
      <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-khaki/10 hover:border-khaki/30 relative overflow-hidden">
        {primaryUrl && (
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              primaryIsSite
                ? `Visit ${project.title} website`
                : `View ${project.title} on GitHub`
            }
            className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-br from-khaki/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />
        <CardHeader className="relative">
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
        <CardContent className="flex-grow relative pointer-events-none">
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={`Technologies used in ${project.title}`}
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
        {primaryUrl && (
          <CardFooter className="flex items-center justify-between gap-2 relative">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-khaki transition-colors">
              {primaryIsSite ? (
                <>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Visit Site
                </>
              ) : (
                <>
                  <Github className="size-4" aria-hidden="true" />
                  View on GitHub
                </>
              )}
            </span>
            {hasSecondaryGithub && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative z-20 hover:text-khaki"
              >
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} on GitHub`}
                >
                  <Github className="size-4" aria-hidden="true" />
                </a>
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const projects: Project[] = [
    {
      title: "pico.domains",
      subtitle: "Ultra-Short Domain Search Engine",
      description:
        "Smart search engine for ultra-short domains. Curates available concise domains and connects with trusted marketplaces.",
      url: "https://www.pico.domains/",
      technologies: [
        "Nuxt.js",
        "CSS",
        "HTML5",
        "TypeScript",
        "Vite",
        "Custom Internal Libraries",
      ],
      image: "/pico-domains.png",
      imageAlt: "Screenshot of pico.domains website",
    },
    {
      title: "Cyclei",
      subtitle: "Sustainability Made Simple",
      description:
        "Curbside collection for reusable containers alongside regular waste. Increases adoption and return rates for sustainable packaging.",
      url: "https://app.cyclei.eco/",
      technologies: ["Vue3", "CSS", "HTML5", "TypeScript", "Vite", "GraphQL"],
      image: "/cyclei.png",
      imageAlt: "Screenshot of Cyclei application",
    },
    {
      title: "Hide Zero Cards",
      subtitle: "Educational Place Value Tool",
      description:
        "Interactive educational tool for fourth-grade students. Features draggable number cards with color-coded place value components.",
      url: "https://hidezerocards.org",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Shadcn/ui",
      ],
      image: "/hide-zero-cards.png",
      imageAlt: "Screenshot of Hide Zero Cards website",
    },
    {
      title: "donray.dev",
      subtitle: "My Digital Home",
      description:
        "Personal portfolio site showcasing projects and skills. Built with modern web technologies for optimal performance.",
      technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
      github: "https://github.com/wdonray/donray.dev",
    },
  ];

  return (
    <section id="projects" aria-labelledby="projects-heading" ref={sectionRef}>
      <div className="space-y-8">
        <SectionHeader
          id="projects-heading"
          title="Projects"
          isInView={isInView}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={`project-${index}-${project.title
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
