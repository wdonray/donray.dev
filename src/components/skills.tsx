"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Atom,
  Code2,
  TestTube,
  Accessibility,
  Code,
  GitBranch,
  Type,
  Layout,
  Globe,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp, scaleInWithDelay } from "@/lib/animations";

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const skills = [
    {
      category: "Frontend Frameworks",
      items: [
        { name: "React", icon: Atom },
        { name: "Next.js", icon: Code2 },
        { name: "Vue", icon: Globe },
        "Nuxt.js",
      ],
    },
    {
      category: "Styling & Layout",
      items: [
        { name: "Tailwind CSS", icon: Layout },
        "CSS",
        "HTML",
        "Responsive Design",
      ],
    },
    {
      category: "Testing Types",
      items: [
        { name: "Unit Testing", icon: TestTube },
        "E2E Testing",
        "Integration Testing",
      ],
    },
    {
      category: "Testing Tools",
      items: [
        { name: "Cypress", icon: Database },
        "Vitest",
        "Playwright",
        "Jest",
      ],
    },
    {
      category: "Design Principles",
      items: [
        { name: "Accessibility", icon: Accessibility },
        "UI/UX Design",
        "Responsive Design",
      ],
    },
    {
      category: "Development Tools",
      items: [
        { name: "TypeScript", icon: Type },
        { name: "JavaScript", icon: Code },
        { name: "Git", icon: GitBranch },
        "VS Code",
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
          {skills.map((skillGroup, index) => (
            <motion.div
              key={skillGroup.category}
              className="space-y-4"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-lg font-medium text-muted-foreground">
                {skillGroup.category}
              </h3>
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label={`${skillGroup.category} skills`}
              >
                {skillGroup.items.map((skill, skillIndex) => {
                  if (typeof skill === "string") {
                    return (
                      <motion.div
                        key={skill}
                        {...scaleInWithDelay(index * 0.1 + skillIndex * 0.05)}
                      >
                        <Badge
                          variant="secondary"
                          className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                          role="listitem"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    );
                  }
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={skill.name}
                      {...scaleInWithDelay(index * 0.1 + skillIndex * 0.05)}
                    >
                      <Badge
                        variant="secondary"
                        className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-1"
                        role="listitem"
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                        <span>{skill.name}</span>
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
              <Separator className="my-4 bg-muted/50" aria-hidden="true" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
