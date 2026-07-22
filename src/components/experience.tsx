"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Briefcase, ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";

interface ExperienceItem {
  company: string;
  location: string;
  website?: string;
  type: string;
  skills?: string[];
  positions: {
    title: string;
    period: string;
  }[];
}

const isCurrentPosition = (period: string) => period.includes("Present");

// One job rendered as an Apple "Tech Specs" row: a left label column
// (company + location + type) and a right detail column (roles timeline +
// skills), separated from the previous row by a hairline divider. On mobile
// the two columns stack.
function JobEntry({
  exp,
  index,
  isInView,
}: {
  exp: ExperienceItem;
  index: number;
  isInView: boolean;
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
          aria-label={`${exp.company} details`}
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
        <div className="space-y-4" role="list" aria-label={`Roles at ${exp.company}`}>
          {exp.positions.map((pos, posIndex) => (
            <div
              key={`position-${posIndex}-${pos.title.toLowerCase().replace(/\s+/g, "-")}`}
              className={`border-l-2 pl-4 ${
                isCurrentPosition(pos.period) ? "border-khaki" : "border-muted"
              }`}
              role="listitem"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-medium">{pos.title}</h4>
                {isCurrentPosition(pos.period) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-khaki/10 text-khaki border-khaki/30"
                  >
                    Current
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" aria-hidden="true" />
                <span>{pos.period}</span>
              </div>
            </div>
          ))}
        </div>

        {exp.skills && (
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={`Technologies used at ${exp.company}`}
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

  const experiences: ExperienceItem[] = [
    {
      company: "Justworks",
      location: "Manhattan, New York, United States",
      type: "Full-time",
      skills: [
        "Team Leadership",
        "Vue.js",
        "JavaScript",
        "Internal Library Engineering",
        "Unit Testing",
        "E2E Testing",
        "Responsive Design",
        "Mentorship",
      ],
      positions: [
        {
          title: "Engineering Manager",
          period: "Jun 2026 – Present",
        },
        {
          title: "Senior Software Engineer",
          period: "Dec 2023 – Jun 2026",
        },
        {
          title: "Software Engineer",
          period: "Jan 2023 – Dec 2023",
        },
      ],
    },
    {
      company: "Cyclei",
      location: "San Francisco Bay Area",
      type: "Freelance",
      skills: [
        "Vue.js",
        "JavaScript",
        "TypeScript",
        "CSS",
        "HTML",
        "Responsive Design",
      ],
      positions: [
        {
          title: "Founding Frontend Engineer",
          period: "Jul 2023 – Aug 2025",
        },
      ],
    },
    {
      company: "Leaflink",
      location: "New York, United States",
      type: "Full-time",
      skills: ["Vue.js", "JavaScript", "TypeScript"],
      positions: [
        {
          title: "Frontend Engineer",
          period: "Jul 2022 – Dec 2022",
        },
      ],
    },
    {
      company: "Stuller, Inc.",
      location: "Lafayette, Louisiana, United States",
      type: "Full-time",
      skills: ["React.js", "Vue.js", "CMS", "JavaScript", "CSS", "HTML"],
      positions: [
        {
          title: "Frontend Engineer II",
          period: "Jan 2021 – Apr 2022",
        },
        {
          title: "Frontend Engineer",
          period: "Nov 2020 – Jan 2021",
        },
      ],
    },
    {
      company: "Gemvision Corporation",
      location: "Lafayette, Louisiana Area",
      type: "Full-time",
      skills: [
        "AWS",
        "AWS Lambda",
        "React.js",
        "Redux.js",
        "JavaScript",
        "TypeScript",
        "Serverless",
      ],
      positions: [
        {
          title: "DevOps Engineer I",
          period: "Jan 2020 – Apr 2020",
        },
      ],
    },
    {
      company: "Buh! Gaming",
      location: "Remote",
      type: "Freelance",
      skills: ["C#", "Unity Game Engine"],
      positions: [
        {
          title: "Game Developer",
          period: "Jun 2018 – Jun 2019",
        },
      ],
    },
    {
      company: "TANTRUM Lab",
      location: "Lafayette, Louisiana Area",
      type: "Contract",
      skills: ["Unity Game Engine", "C#", "VR Development"],
      positions: [
        {
          title: "VR Development Intern",
          period: "Oct 2018 – Dec 2018",
        },
      ],
    },
    {
      company: "Academy of Interactive Entertainment (AIE)",
      location: "Lafayette, Louisiana Area",
      type: "Contract",
      skills: ["Unity Game Engine", "C#", "Teaching"],
      positions: [
        {
          title: "Game Programmer Summer Camp Instructor",
          period: "Jun 2017 – Jul 2017",
        },
      ],
    },
  ];

  const recentExperiences = experiences.slice(0, 4); // Justworks through Stuller
  const olderExperiences = experiences.slice(4); // Gemvision through AIE

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
    <section id="experience" aria-labelledby="experience-heading" ref={sectionRef}>
      <div className="space-y-8">
        <SectionHeader
          id="experience-heading"
          title="Experience"
          isInView={isSectionInView}
        />
        <div
          ref={companiesRef}
          className="space-y-8"
          role="list"
          aria-label="Professional experience timeline"
        >
          {recentExperiences.map((exp, index) => (
            <JobEntry
              key={`company-${index}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
              exp={exp}
              index={index}
              isInView={isCompaniesInView}
            />
          ))}

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
                  {showOlderExperiences
                    ? "Hide Earlier Experience"
                    : "View Earlier Experience"}
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
                  >
                    {olderExperiences.map((exp, index) => (
                      <JobEntry
                        key={`company-${index + 4}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
                        exp={exp}
                        index={index}
                        isInView={isCompaniesInView}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
