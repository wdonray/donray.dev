"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";

export default function Header() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear the previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to update the state after 100ms of no scrolling
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 0);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-x border-border ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
      role="banner"
    >
      <div className="px-4 md:px-8 h-16 flex items-center justify-between max-w-[2000px] mx-auto">
        <Link
          href="#hero"
          className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
          aria-label="Scroll to top"
        >
          donray.dev
        </Link>

        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Main navigation"
        >
          <Link
            href="#skills"
            className="text-sm hover:text-primary transition-colors"
            aria-label="View skills section"
          >
            Skills
          </Link>

          <Link
            href="#projects"
            className="text-sm hover:text-primary transition-colors"
            aria-label="View projects section"
          >
            Projects
          </Link>

          <Link
            href="#experience"
            className="text-sm hover:text-primary transition-colors"
            aria-label="View experience section"
          >
            Experience
          </Link>

          <ModeToggle />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5 cursor-pointer" aria-hidden="true" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="w-full h-[80vh]">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-4 mt-6 px-4"
                aria-label="Mobile navigation"
              >
                <SheetClose asChild>
                  <Link href="#skills" className="text-xl font-bold">
                    Skills
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="#experience" className="text-xl font-bold">
                    Experience
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="#projects" className="text-xl font-bold">
                    Projects
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
