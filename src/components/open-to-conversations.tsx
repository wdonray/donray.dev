"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Coffee, GraduationCap, Mic, Podcast, Users, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";

const CONVERSATIONS = [
  {
    icon: Coffee,
    title: "EM coffee chats",
    description:
      "Talking shop with other engineering managers — player-coach life, frontend leadership, growing engineers.",
  },
  {
    icon: GraduationCap,
    title: "Frontend mentorship",
    description:
      "Helping developers level up on Vue, TypeScript, and building for scale.",
  },
  {
    icon: Mic,
    title: "Conference speaking",
    description:
      "Talks on onboarding flows, billing UX, and leading frontend teams as a player-coach.",
  },
  {
    icon: Podcast,
    title: "Podcast guesting",
    description:
      "Conversations about engineering management, frontend architecture, and shipping real products.",
  },
  {
    icon: Users,
    title: "Peer conversations",
    description:
      "Comparing notes with other EMs on hiring, team health, and staying technical while managing.",
  },
];

const EMAIL = "donrayxwilliams@gmail.com";

/**
 * "Open to conversations" — a specific, non-job-seeking availability
 * section. Donray is employed at Justworks; this routes the right inbound
 * (collaboration, mentorship, speaking) instead of recruiter spam.
 */
export default function OpenToConversations() {
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: "-100px",
  });

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
          title="Open to conversations"
          isInView={isSectionInView}
        />
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground max-w-2xl"
        >
          I&apos;m happily at Justworks — not looking for a new role. But I am
          always up for good conversations with peers, mentees, and conference
          organizers. Based in New Jersey (ET), working hybrid.
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONVERSATIONS.map((item, index) => (
            <motion.div key={item.title} variants={fadeInUp} custom={index}>
              <Card className="h-full">
                <CardContent className="space-y-2">
                  <item.icon
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div variants={fadeInUp} custom={CONVERSATIONS.length}>
            <Card className="h-full border-primary/50 bg-primary/5">
              <CardContent className="space-y-2">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Say hello</h3>
                <p className="text-sm text-muted-foreground">
                  The fastest way to reach me is email — I read everything.
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
