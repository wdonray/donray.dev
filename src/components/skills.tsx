"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Atom,
  Server,
  FlaskConical,
  Container,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";

interface SkillGroup {
  category: string;
  icon: LucideIcon;
  items: string[];
}

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const skills: SkillGroup[] = [
    {
      category: "Frontend Development",
      icon: Atom,
      items: ["Vue 3", "TypeScript", "JavaScript", "React", "Next.js", "Vite"],
    },
    {
      category: "Backend & APIs",
      icon: Server,
      items: ["Go", "REST APIs", "GraphQL", "OpenAPI", "Node.js"],
    },
    {
      category: "Testing & Quality",
      icon: FlaskConical,
      items: [
        "Vitest",
        "Playwright",
        "Unit Testing",
        "E2E Testing",
        "Test Automation",
      ],
    },
    {
      category: "Platform & DevOps",
      icon: Container,
      items: ["Docker", "Helm", "CI/CD", "Git", "Package Management"],
    },
    {
      category: "UI & Web Standards",
      icon: Palette,
      items: [
        "Tailwind CSS",
        "CSS/SASS",
        "HTML5",
        "Responsive Design",
        "Accessibility",
        "Component Libraries",
      ],
    },
    {
      category: "Leadership & Craft",
      icon: Users,
      items: [
        "Team Leadership",
        "Mentorship",
        "Architecture Design",
        "Code Review",
        "Technical Writing",
      ],
    },
  ];

  return (
    <section id="skills" aria-labelledby="skills-heading">
      <div className="space-y-8">
        <SectionHeader
          id="skills-heading"
          title="Skills & Expertise"
          isInView={isInView}
        />
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skillGroup, index) => {
            const Icon = skillGroup.icon;
            return (
              <motion.div
                key={skillGroup.category}
                className="space-y-4 h-full flex flex-col"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ delay: index * 0.05 }}
              >
                <h3 className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
                  <Icon className="size-4 text-khaki" aria-hidden="true" />
                  {skillGroup.category}
                </h3>
                <div
                  className="flex flex-wrap content-start items-start gap-2 flex-grow"
                  role="list"
                  aria-label={`${skillGroup.category} skills`}
                >
                  {skillGroup.items.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                      role="listitem"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Separator className="mt-auto bg-muted/50" aria-hidden="true" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
