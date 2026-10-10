"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Briefcase,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";

interface ExperiencePosition {
  title: string;
  period: string;
  description?: string;
  link?: { href: string; label: string };
  /** Marks the current role. Structural, not translated. */
  current?: boolean;
}

interface ExperienceItem {
  company: string;
  location: string;
  type: string;
  skills?: string[];
  positions: ExperiencePosition[];
}

const isCurrentPosition = (pos: ExperiencePosition) => pos.current === true;

// One job rendered as an Apple "Tech Specs" row: a left label column
// (company + location + type) and a right detail column (roles timeline +
// skills), separated from the previous row by a hairline divider. On mobile
// the two columns stack.
function JobEntry({
  exp,
  index,
  isInView,
  t,
}: {
  exp: ExperienceItem;
  index: number;
  isInView: boolean;
  t: ReturnType<typeof useTranslations<"home.experience">>;
}) {
  return (
    <motion.div
      className="grid gap-x-8 gap-y-4 border-t border-border pt-8 md:grid-cols-[minmax(0,15rem)_1fr]"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay: index * 0.05 }}
      role="listitem"
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{exp.company}</h3>
        <div
          className="flex flex-col gap-1 text-sm text-muted-foreground"
          role="group"
          aria-label={t("companyDetails", { company: exp.company })}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>{exp.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="size-4 shrink-0" aria-hidden="true" />
            <span>{exp.type}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div
          className="space-y-4"
          role="list"
          aria-label={t("rolesAt", { company: exp.company })}
        >
          {exp.positions.map((pos, posIndex) => (
            <div
              key={`position-${posIndex}-${pos.title.toLowerCase().replace(/\s+/g, "-")}`}
              className={`border-l-2 pl-4 ${
                isCurrentPosition(pos) ? "border-khaki" : "border-muted"
              }`}
              role="listitem"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-medium">{pos.title}</h4>
                {isCurrentPosition(pos) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-khaki/10 text-khaki border-khaki/30"
                  >
                    {t("current")}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" aria-hidden="true" />
                <span>{pos.period}</span>
              </div>
              {pos.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {pos.description}
                </p>
              )}
              {pos.link && (
                <a
                  href={pos.link.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {pos.link.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>

        {exp.skills && (
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={t("technologiesAt", { company: exp.company })}
          >
            {exp.skills.map((skill, i) => (
              <Badge
                key={`skill-${i}-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                variant="secondary"
                className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                role="listitem"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const t = useTranslations("home.experience");
  const [showOlderExperiences, setShowOlderExperiences] = useState(false);
  const sectionRef = useRef(null);
  const companiesRef = useRef(null);
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: "-100px",
  });
  const isCompaniesInView = useInView(companiesRef, {
    once: true,
    margin: "-100px",
  });

  const experiences = t.raw("jobs") as ExperienceItem[];
  const recentExperiences = experiences.slice(0, 4);
  const olderExperiences = experiences.slice(4);

  const toggleOlderExperiences = () => {
    setShowOlderExperiences(!showOlderExperiences);
    if (!showOlderExperiences) {
      // Wait for the animation to start before scrolling
      setTimeout(() => {
        const element = document.getElementById("older-experiences");
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      ref={sectionRef}
    >
      <div className="space-y-8">
        <SectionHeader
          id="experience-heading"
          title={t("title")}
          isInView={isSectionInView}
        />
        <div
          ref={companiesRef}
          className="space-y-8"
          role="list"
          aria-label={t("timelineLabel")}
        >
          {recentExperiences.map((exp, index) => (
            <JobEntry
              key={`company-${index}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
              exp={exp}
              index={index}
              isInView={isCompaniesInView}
              t={t}
            />
          ))}
        </div>

        {olderExperiences.length > 0 && (
          <div className="space-y-8">
            <button
              onClick={toggleOlderExperiences}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50 px-6 py-2.5 rounded-md mx-auto"
              aria-expanded={showOlderExperiences}
            >
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  showOlderExperiences ? "rotate-180" : ""
                }`}
              />
              <span className="font-medium">
                {showOlderExperiences ? t("hideEarlier") : t("viewEarlier")}
              </span>
            </button>

            <AnimatePresence>
              {showOlderExperiences && (
                <motion.div
                  id="older-experiences"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-8 overflow-hidden"
                  role="list"
                  aria-label={t("earlierLabel")}
                >
                  {olderExperiences.map((exp, index) => (
                    <JobEntry
                      key={`company-${index + 4}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
                      exp={exp}
                      index={index}
                      isInView={isCompaniesInView}
                      t={t}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
