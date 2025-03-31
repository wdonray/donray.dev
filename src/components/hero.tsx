"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
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
  return (
    <section id="hero" aria-labelledby="hero-heading">
      <div className="max-w-[2000px] mx-auto w-full h-[700px] flex flex-col md:flex-row gap-10 items-center justify-between">
        <div className="space-y-6 text-center md:text-left">
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
            <span className="font-bold">5+ years</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            {...fadeInUpWithDelay(0.6)}
          >
            <Button
              size="lg"
              className="cursor-pointer"
              aria-label="Download CV"
              asChild
            >
              <a href="/DonrayWilliamsResume.pdf" download>
                <Download className="size-4" aria-hidden="true" />
                Download CV
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
          className="block relative w-[300px] h-[300px] md:w-[450px] md:h-[450px]"
        >
          <Image
            src="/headshot.webp"
            alt="Donray Williams"
            fill
            className="object-cover rounded-full shadow-lg hover:scale-105 transition-all duration-300"
            priority
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
