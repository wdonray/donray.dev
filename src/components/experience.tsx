"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Briefcase, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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
        "Vue",
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
      skills: ["Vue", "JavaScript", "TypeScript", "CSS", "HTML", "Responsive Design"],
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
      skills: ["Vue", "JavaScript", "TypeScript"],
      positions: [
        {
          title: "Frontend Engineer",
          period: "Jul 2023 – Dec 2022",
        },
      ],
    },
    {
      company: "Stuller, Inc.",
      location: "Lafayette, Louisiana, United States",
      type: "Full-time",
      skills: [
        "React",
        "Vue",
        "CMS",
        "JavaScript",
        "CSS",
        "HTML",
      ],
      positions: [
        {
          title: "Frontend Engineer II",
          period: "Jan 2021 – Apr 2022",
        },
        {
          title: "Frontend Engineer",
          period: "Jan 2021 – Jan 2023",
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
      skills: ["C#", "Unity"],
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
      skills: ["Unity", "C#", "VR Development"],
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
      skills: ["Unity", "C#", "Teaching"],
      positions: [
        {
          title: "Game Programmer Summer Camp Instructor",
          period: "Jun 2017 – Jul 2017",
        },
      ],
    },
  ];

  const isCurrentPosition = (period: string) => period.includes("Present");

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
          {experiences.map((exp, index) => (
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
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={
                          isCompaniesInView
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 0, scale: 0.8 }
                        }
                        transition={{ delay: index * 0.1 + i * 0.05 }}
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isCompaniesInView
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -20 }
                  }
                  transition={{ delay: index * 0.1 + posIndex * 0.05 }}
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
        </div>
      </div>
    </section>
  );
}
