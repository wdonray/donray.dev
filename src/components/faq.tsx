"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";
import { getFaqJsonLd, serializeJsonLd, type FaqItem } from "@/lib/schema";

const FAQS: FaqItem[] = [
  {
    question: "What do you do at Justworks?",
    answer:
      "I'm a player-coach Engineering Manager leading a team of 3. I own frontend for member onboarding and billing — setting technical direction, reviewing the team's code, and still writing production code myself.",
  },
  {
    question: "Are you open to new roles?",
    answer:
      "No — I'm happily at Justworks and not looking for a new role. I am open to conversations: EM coffee chats, frontend mentorship, conference speaking, and podcast guesting.",
  },
  {
    question: "What's your technical background?",
    answer:
      "7+ years building for the web. As a Senior Software Engineer I built org-wide typed fetch and shared frontend config libraries, and helped move customer traffic from roughly half to roughly three-quarters onto the new app. My core stack is Vue, TypeScript, and Ruby on Rails.",
  },
  {
    question: "Where are you based?",
    answer:
      "I live in New Jersey and work out of New York City (Eastern Time), hybrid.",
  },
  {
    question: "What's the fastest way to reach you?",
    answer: "Email — donrayxwilliams@gmail.com. I read everything.",
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
          {FAQS.map((faq, index) => (
            <motion.details
              key={faq.question}
              variants={fadeInUp}
              custom={index}
              className="group rounded-xl border bg-card px-6 py-4 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
