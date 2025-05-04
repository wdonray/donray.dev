"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Briefcase, Sparkles, ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import {
  fadeInUp,
  scaleInWithDelay,
  slideInLeftWithDelay,
} from "@/lib/animations";

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

export default function Experience() {
  const [showOlderExperiences, setShowOlderExperiences] = useState(false);
  // Create refs for each major section
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
          title: "Senior Software Engineer",
          period: "Dec 2023 – Present",
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
          period: "Jul 2023 – Present",
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

  const isCurrentPosition = (period: string) => period.includes("Present");

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
      }, 300); // Increased delay to match animation duration
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
          title="Experience"
          isInView={isSectionInView}
        />
        <div
          ref={companiesRef}
          className="space-y-12"
          role="list"
          aria-label="Professional experience timeline"
        >
          {recentExperiences.map((exp, index) => (
            <motion.div
              key={`company-${index}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
              className="space-y-4"
              initial="hidden"
              animate={isCompaniesInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              role="listitem"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{exp.company}</h3>
                  {exp.positions.some((pos) =>
                    isCurrentPosition(pos.period),
                  ) && (
                    <Badge
                      variant="default"
                      className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Sparkles className="size-3 mr-1" aria-hidden="true" />
                      Current
                    </Badge>
                  )}
                </div>
                <div
                  className="flex flex-wrap gap-4 text-sm text-muted-foreground"
                  role="group"
                  aria-label={`${exp.company} details`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden="true" />
                    <span>{exp.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="size-4" aria-hidden="true" />
                    <span>{exp.type}</span>
                  </div>
                </div>
                {exp.skills && (
                  <div
                    className="flex flex-wrap gap-2 mt-2"
                    role="list"
                    aria-label={`Technologies used at ${exp.company}`}
                  >
                    {exp.skills.map((skill, i) => (
                      <motion.div
                        key={`skill-${index}-${i}-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                        {...scaleInWithDelay(index * 0.1 + i * 0.05)}
                        role="listitem"
                      >
                        <Badge
                          variant="secondary"
                          className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {exp.positions.map((pos, posIndex) => (
                <motion.div
                  key={`position-${index}-${posIndex}-${pos.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`ml-4 pl-4 border-l-2 ${
                    isCurrentPosition(pos.period)
                      ? "border-primary"
                      : "border-muted"
                  }`}
                  {...slideInLeftWithDelay(index * 0.1 + posIndex * 0.05)}
                  role="listitem"
                >
                  <div
                    className="space-y-2"
                    role="group"
                    aria-label={`${pos.title} at ${exp.company}`}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-medium">{pos.title}</h4>
                      {isCurrentPosition(pos.period) && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/5 text-primary border-primary/20"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1 text-sm text-muted-foreground"
                      role="group"
                      aria-label="Position duration"
                    >
                      <Calendar className="size-4" aria-hidden="true" />
                      <span>{pos.period}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))}

          {olderExperiences.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={toggleOlderExperiences}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50 px-6 py-2 rounded-md mx-auto"
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
                    className="space-y-12 overflow-hidden"
                  >
                    {olderExperiences.map((exp, index) => (
                      <motion.div
                        key={`company-${index + 4}-${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
                        className="space-y-4"
                        initial="hidden"
                        animate={isCompaniesInView ? "visible" : "hidden"}
                        variants={fadeInUp}
                        transition={{ delay: (index + 4) * 0.1 }}
                        role="listitem"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{exp.company}</h3>
                            {exp.positions.some((pos) =>
                              isCurrentPosition(pos.period),
                            ) && (
                              <Badge
                                variant="default"
                                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <Sparkles className="size-3 mr-1" aria-hidden="true" />
                                Current
                              </Badge>
                            )}
                          </div>
                          <div
                            className="flex flex-wrap gap-4 text-sm text-muted-foreground"
                            role="group"
                            aria-label={`${exp.company} details`}
                          >
                            <div className="flex items-center gap-1">
                              <MapPin className="size-4" aria-hidden="true" />
                              <span>{exp.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="size-4" aria-hidden="true" />
                              <span>{exp.type}</span>
                            </div>
                          </div>
                          {exp.skills && (
                            <div
                              className="flex flex-wrap gap-2 mt-2"
                              role="list"
                              aria-label={`Technologies used at ${exp.company}`}
                            >
                              {exp.skills.map((skill, i) => (
                                <motion.div
                                  key={`skill-${index + 4}-${i}-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                                  {...scaleInWithDelay((index + 4) * 0.1 + i * 0.05)}
                                  role="listitem"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="text-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                                  >
                                    {skill}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        {exp.positions.map((pos, posIndex) => (
                          <motion.div
                            key={`position-${index + 4}-${posIndex}-${pos.title.toLowerCase().replace(/\s+/g, "-")}`}
                            className={`ml-4 pl-4 border-l-2 ${
                              isCurrentPosition(pos.period)
                                ? "border-primary"
                                : "border-muted"
                            }`}
                            {...slideInLeftWithDelay((index + 4) * 0.1 + posIndex * 0.05)}
                            role="listitem"
                          >
                            <div
                              className="space-y-2"
                              role="group"
                              aria-label={`${pos.title} at ${exp.company}`}
                            >
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-medium">{pos.title}</h4>
                                {isCurrentPosition(pos.period) && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-primary/5 text-primary border-primary/20"
                                  >
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div
                                className="flex items-center gap-1 text-sm text-muted-foreground"
                                role="group"
                                aria-label="Position duration"
                              >
                                <Calendar className="size-4" aria-hidden="true" />
                                <span>{pos.period}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
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
