"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { fadeInUpWithDelay, imageScale } from "@/lib/animations";

export default function Hero() {
  const yearsSince2019 = new Date().getFullYear() - 2019;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex items-center"
    >
      <div className="flex flex-col md:flex-row gap-16 md:gap-10 items-center justify-between w-full">
        <div className="space-y-6 text-center md:text-left" id="hero-content">
          <motion.h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            {...fadeInUpWithDelay(0)}
          >
            Hi, I&apos;m{" "}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="cursor-help"
                  aria-label="Name pronunciation for Donray Williams"
                >
                  Donray Williams
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pronounced: Don·RAY Wil·ymz</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>{" "}
            <span className="wave-emoji" role="img" aria-label="Waving hand">
              👋🏽
            </span>
          </motion.h1>

          <motion.h2
            className="text-2xl md:text-3xl text-muted-foreground"
            {...fadeInUpWithDelay(0.2)}
          >
            Senior Frontend Engineer
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-[600px]"
            {...fadeInUpWithDelay(0.4)}
          >
            Crafting exceptional digital experiences through clean code and
            innovative design for over{" "}
            <span className="font-bold">{yearsSince2019}+ years</span>.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-4"
            {...fadeInUpWithDelay(0.6)}
          >
            <Button
              size="lg"
              className="cursor-pointer"
              aria-label="View Resume"
              asChild
            >
              <a
                href="https://donray-public.s3.us-east-1.amazonaws.com/Donray+Williams+Frontend+Engineer.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                View Resume
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer"
              asChild
            >
              <a
                href="mailto:donrayxwilliams@gmail.com"
                aria-label="Contact via email"
              >
                <Mail className="size-4" aria-hidden="true" />
                Contact Me
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          {...imageScale}
          transition={{ delay: 0.8 }}
          className="block relative w-[200px] md:w-[450px] aspect-square"
          id="hero-image"
        >
          <Image
            src="/headshot.webp"
            alt="Donray Williams"
            fill
            className="object-cover rounded-full shadow-lg hover:scale-105 transition-all duration-300"
            priority
            quality={100}
            sizes="(max-width: 768px) 300px, 450px"
          />
        </motion.div>
      </div>
    </section>
  );
}
