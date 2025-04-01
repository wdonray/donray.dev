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
      className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center justify-between w-full max-w-[2000px] mx-auto">
        <div className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left" id="hero-content">
          <motion.h1
            id="hero-heading"
            className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-8xl font-bold tracking-tight"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground"
            {...fadeInUpWithDelay(0.2)}
          >
            Senior Frontend Engineer
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[600px]"
            {...fadeInUpWithDelay(0.4)}
          >
            Crafting exceptional digital experiences through clean code and
            innovative design for over{" "}
            <span className="font-bold">{yearsSince2019}+ years</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-[250px] mx-auto md:mx-0"
            {...fadeInUpWithDelay(0.6)}
          >
            <Button
              size="lg"
              className="cursor-pointer text-sm sm:text-base"
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
              className="cursor-pointer text-sm sm:text-base"
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
          className="block relative w-[200px] sm:w-[250px] md:w-[350px] lg:w-[450px] xl:w-[550px] 2xl:w-[650px] aspect-square"
          id="hero-image"
        >
          <Image
            src="/headshot.webp"
            alt="Donray Williams"
            fill
            className="object-cover rounded-full shadow-lg hover:scale-105 transition-all duration-300"
            priority
            quality={100}
            sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 350px, (max-width: 1280px) 450px, (max-width: 1536px) 550px, 650px"
          />
        </motion.div>
      </div>
    </section>
  );
}
