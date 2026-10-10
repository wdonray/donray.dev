"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { getFaqJsonLd, serializeJsonLd, type FaqItem } from "@/lib/schema";

/**
 * FAQ section with FAQPage structured data. Direct-answer-first format
 * targets featured snippets and AI-answer extraction.
 */
export default function Faq() {
  const t = useTranslations("home.faq");
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: "-100px",
  });
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const FAQS = t.raw("items") as FaqItem[];

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
          title={t("title")}
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
