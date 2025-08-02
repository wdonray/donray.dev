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
import { ExternalLink, Github } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionSubHeader } from "@/components/ui/section-subheader";
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
  type: "website" | "library";
}

export default function Projects() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const projects: Project[] = [
    {
      title: "pico.domains",
      subtitle: "Ultra-Short Domain Search Engine",
      description:
        "Find the perfect ultra-short domain for your brand or startup. pico.domains is a smart search engine that curates the best available concise domains and connects you with trusted marketplaces—making your next great domain just a click away.",
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
      type: "website",
    },
    {
      title: "Cyclei",
      subtitle: "Sustainability Made Simple",
      description:
        "Cyclei makes sustainability simple by offering curbside collection for reusable containers alongside your regular trash and recycling. Our service helps increase adoption and return rates for reusable packaging—making it easier for everyone to go green.",
      url: "https://app.cyclei.eco/",
      technologies: ["Vue3", "CSS", "HTML5", "TypeScript", "Vite", "GraphQL"],
      image: "/cyclei.png",
      imageAlt: "Screenshot of Cyclei application",
      type: "website",
    },
    {
      title: "Hide Zero Cards",
      subtitle: "Educational Place Value Tool",
      description:
        "A digital educational tool designed for fourth-grade students to learn place value concepts through interactive, draggable number cards. Students can visualize how large numbers are composed of individual place value components, with color-coded cards and hands-on manipulation.",
      url: "https://main.dmh49rcj7joyy.amplifyapp.com",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Shadcn/ui",
      ],
      image: "/hide-zero-cards.png",
      imageAlt: "Screenshot of Hide Zero Cards website",
      type: "website",
    },
    {
      title: "donray.dev",
      subtitle: "My Digital Home",
      description:
        "Welcome to my personal site! Built with Next.js and Tailwind CSS, this site is my digital home for sharing projects, skills, and ideas. Explore my work and see what I'm building next.",
      technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
      image: "/headshot.webp",
      imageAlt: "Screenshot of Donray.dev website",
      github: "https://github.com/wdonray/donray.dev",
      type: "website",
    },
    {
      title: "genesis",
      subtitle: "UI Component Library for Vue.js",
      description:
        "A comprehensive Vue 3 component library that makes building accessible, modern web apps a breeze. Powering pico.domains and other projects, Genesis provides a rich set of reusable components—from buttons to modals—all built with accessibility and responsive design in mind. Build polished interfaces faster with Genesis.",
      technologies: [
        "Vue 3",
        "Vite",
        "Storybook",
        "Vitest",
        "Floating UI",
        "VeeValidate",
      ],
      type: "library",
    },
    {
      title: "doctrine",
      subtitle: "Unified Project Configuration Suite",
      description:
        "A powerful configuration toolkit that simplifies modern web development. Doctrine standardizes setup for essential tools like ESLint, Stylelint, and Vite, ensuring consistent code quality across projects. Used by Genesis and pico.domains, it's the foundation for maintaining high development standards.",
      technologies: [
        "Node.js",
        "ESLint",
        "Stylelint",
        "PostCSS",
        "Vite",
        "Nuxt",
        "Prettier",
      ],
      type: "library",
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
        {/* Websites & Apps Section */}
        <SectionSubHeader>Websites & Apps</SectionSubHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {projects
            .filter((p) => p.type === "website")
            .map((project, index) => (
              <motion.div
                key={`project-website-${index}-${project.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                variants={itemVariants}
                role="listitem"
              >
                <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                  <CardHeader className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
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
                  <CardContent className="flex-grow relative">
                    <div
                      className="flex flex-wrap gap-2"
                      role="list"
                      aria-label={`Technologies used in ${project.title}`}
                    >
                      {project.technologies.map((tech, i) => (
                        <Badge
                          key={`tech-${i}-${tech
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          variant="secondary"
                          className="bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 relative">
                    {project.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      >
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${project.title} website`}
                        >
                          <ExternalLink
                            className="size-4 mr-2"
                            aria-hidden="true"
                          />
                          Visit Site
                        </a>
                      </Button>
                    )}
                    {project.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
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
                </Card>
              </motion.div>
            ))}
        </div>
        {/* Internal Libraries & Tools Section */}
        <SectionSubHeader>Internal Libraries & Tools</SectionSubHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {projects
            .filter((p) => p.type === "library")
            .map((project, index) => (
              <motion.div
                key={`project-library-${index}-${project.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                variants={itemVariants}
                role="listitem"
              >
                <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                  <CardHeader className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {project.title}
                          {project.subtitle && (
                            <div className="text-xs font-normal text-muted-foreground mt-1">
                              {project.subtitle}
                            </div>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-2">
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
                  <CardContent className="flex-grow relative">
                    <div
                      className="flex flex-wrap gap-2"
                      role="list"
                      aria-label={`Technologies used in ${project.title}`}
                    >
                      {project.technologies.map((tech, i) => (
                        <Badge
                          key={`tech-${i}-${tech
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          variant="secondary"
                          className="bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 relative">
                    {project.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
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
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
