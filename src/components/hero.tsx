"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUpWithDelay, imageScale } from "@/lib/animations";

export default function Hero() {
  const yearsSince2019 = new Date().getFullYear() - 2019;

  const h1Size = "text-4xl sm:text-6xl lg:text-7xl";
  const h2Size = "text-xl sm:text-2xl lg:text-3xl";
  const pSize = "text-base sm:text-lg lg:text-xl";

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex items-center"
    >
      <div className="flex flex-col md:flex-row gap-10 sm:gap-12 md:gap-16 lg:gap-20 items-center justify-between w-full">
        <div
          className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left"
          id="hero-content"
        >
          <motion.h1
            id="hero-heading"
            className={`${h1Size} font-bold tracking-tight`}
            {...fadeInUpWithDelay(0)}
          >
            Hi, I&apos;m Donray Williams
          </motion.h1>

          <motion.h2
            className={`${h2Size} font-normal text-muted-foreground`}
            {...fadeInUpWithDelay(0.05)}
          >
            Engineering Manager
          </motion.h2>

          <motion.p
            className={`${pSize} text-muted-foreground max-w-xl`}
            {...fadeInUpWithDelay(0.1)}
          >
            I build fast, accessible web experiences.{" "}
            <span className="font-bold">{yearsSince2019}+ years</span> turning
            ideas into polished products.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-sm mx-auto md:mx-0"
            {...fadeInUpWithDelay(0.15)}
          >
            <Button
              size="lg"
              className="cursor-pointer text-sm sm:text-base h-11"
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
              className="cursor-pointer text-sm sm:text-base h-11"
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
          transition={{ ...imageScale.transition, delay: 0.1 }}
          className="block relative w-[200px] sm:w-[250px] md:w-[350px] lg:w-[450px] xl:w-[500px] aspect-square shrink-0"
          id="hero-image"
        >
          <Image
            src="/headshot.webp"
            alt="Donray Williams"
            fill
            className="object-cover rounded-full shadow-lg"
            priority
            quality={100}
            sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 350px, (max-width: 1280px) 450px, 500px"
          />
        </motion.div>
      </div>
    </section>
  );
}
