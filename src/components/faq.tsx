"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { getFaqJsonLd, serializeJsonLd, type FaqItem } from "@/lib/schema";

const FAQS: FaqItem[] = [
  {
    question: "What do you do at Justworks?",
    answer:
      "I'm a player-coach Engineering Manager leading a team of 3. I own frontend for all things onboarding, member and company, plus billing. I set technical direction, review the team's code, and still write production code myself.",
  },
  {
    question: "Are you open to new roles?",
    answer:
      "No. I'm happily at Justworks and not looking for a new role. I am open to conversations: EM coffee chats, frontend mentorship, conference speaking, and podcast guesting.",
  },
  {
    question: "What's your technical background?",
    answer:
      "7+ years building for the web, starting at Stuller in Louisiana before moving north: Leaflink, Cyclei (founding frontend engineer), and Justworks, where I grew from Software Engineer to Senior to Engineering Manager. As a senior I built the org-wide typed fetch library and shared frontend config libraries, and helped move customer traffic from roughly half to roughly three-quarters onto the new app. Core stack is Vue, TypeScript, and Ruby on Rails, with Go, Node.js, Vitest, Playwright, and GitHub Actions in regular rotation. Very comfortable with AI tooling: Cursor and Claude Code are daily drivers, and I rolled out Claude PR review across our frontend org.",
  },
  {
    question: "Where are you based?",
    answer:
      "I live in New Jersey and work out of New York City (Eastern Time), hybrid.",
  },
  {
    question: "What's the fastest way to reach you?",
    answer: "Email: donrayxwilliams@gmail.com. I read everything.",
  },
];

/**
 * FAQ section with FAQPage structured data. Direct-answer-first format
 * targets featured snippets and AI-answer extraction.
 */
export default function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: "-100px",
  });
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <motion.section
      aria-labelledby="faq-heading"
      ref={sectionRef}
      initial="hidden"
      animate={isSectionInView ? "visible" : "hidden"}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(getFaqJsonLd(FAQS)),
        }}
      />
      <div className="space-y-8">
        <SectionHeader
          id="faq-heading"
          title="Frequently asked questions"
          isInView={isSectionInView}
        />
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const open = openIndexes.has(index);
            return (
              <motion.div
                key={faq.question}
                variants={fadeInUp}
                custom={index}
                className="rounded-xl border bg-card px-6 py-4 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-button-${index}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold"
                >
                  {faq.question}
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="panel"
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
