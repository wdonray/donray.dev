"use client";

import { useTranslations } from "next-intl";
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
  items: string[];
  icon: LucideIcon;
}

const groupIcons: LucideIcon[] = [
  Atom,
  Server,
  FlaskConical,
  Container,
  Palette,
  Users,
];

export default function Skills() {
  const t = useTranslations("home.skills");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const groups = t.raw("groups") as { category: string; items: string[] }[];
  // Parallel to the message catalog's groups; keep the order in sync.
  const skills: SkillGroup[] = groups.map((group, i) => ({
    ...group,
    icon: groupIcons[i],
  }));

  return (
    <section id="skills" aria-labelledby="skills-heading">
      <div className="space-y-8">
        <SectionHeader
          id="skills-heading"
          title={t("title")}
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
                  aria-label={t("skillsLabel", {
                    category: skillGroup.category,
                  })}
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
