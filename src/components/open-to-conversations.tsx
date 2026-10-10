"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Coffee, GraduationCap, Mic, Podcast, Users, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";

const conversationIcons = [Coffee, GraduationCap, Mic, Podcast, Users];

const EMAIL = "donrayxwilliams@gmail.com";

/**
 * "Open to conversations": a specific, non-job-seeking availability
 * section. Donray is employed at Justworks; this routes the right inbound
 * (collaboration, mentorship, speaking) instead of recruiter spam.
 */
export default function OpenToConversations() {
  const t = useTranslations("home.conversations");
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: "-100px",
  });

  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <motion.section
      aria-labelledby="conversations-heading"
      ref={sectionRef}
      initial="hidden"
      animate={isSectionInView ? "visible" : "hidden"}
    >
      <div className="space-y-8">
        <SectionHeader
          id="conversations-heading"
          title={t("title")}
          isInView={isSectionInView}
        />
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground max-w-2xl"
        >
          {t("intro")}
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const Icon = conversationIcons[index] ?? Coffee;
            return (
              <motion.div key={item.title} variants={fadeInUp} custom={index}>
                <Card className="h-full">
                  <CardContent className="space-y-2">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          <motion.div variants={fadeInUp} custom={items.length}>
            <Card className="h-full border-primary/50 bg-primary/5">
              <CardContent className="space-y-2">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">{t("sayHello")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("sayHelloDescription")}
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-block text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {EMAIL}
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
