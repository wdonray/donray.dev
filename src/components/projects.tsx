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

interface Project {
  title: string;
  description: string;
  url: string;
  github?: string;
  technologies: string[];
}

export default function Projects() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const projects: Project[] = [
    {
      title: "pico.domains",
      description:
        "Struggling to find the perfect domain name? Let us help! Our platform makes discovering ultra-short domain names easy for your brand or startup. We act as a smart search engine, curating the best available options and connecting you with trusted marketplaces for high-value, concise domains.",
      url: "https://www.pico.domains/",
      technologies: ["Nuxt.js", "CSS", "HTML5", "Custom Internal Libraries"],
    },
    {
      title: "Cyclei",
      description:
        "Cyclei provides curbside collection for reusable containers during weekly trash and recycling pickup, aiming to boost adoption and return rates for reusable packaging while simplifying sustainability.",
      url: "https://app.cyclei.eco/",
      technologies: ["Vue3", "CSS", "HTML5"],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="projects" aria-labelledby="projects-heading" ref={sectionRef}>
      <div className="space-y-8">
        <SectionHeader
          id="projects-heading"
          title="Projects"
          isInView={isInView}
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-2"
          role="list"
          aria-label="Featured projects"
        >
          {projects.map((project, index) => (
            <motion.div
              key={`project-${index}-${project.title.toLowerCase().replace(/\s+/g, "-")}`}
              variants={itemVariants}
              role="listitem"
            >
              <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label={`Technologies used in ${project.title}`}
                  >
                    {project.technologies.map((tech, i) => (
                      <Badge
                        key={`tech-${i}-${tech.toLowerCase().replace(/\s+/g, "-")}`}
                        variant="secondary"
                        className="bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 relative">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
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
        </motion.div>
      </div>
    </section>
  );
}
