"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Code2, Briefcase, Rocket, Mail } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Github, Linkedin } from "./ui/brand-icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";

const contactLinks = [
  {
    name: "Email",
    url: "mailto:donrayxwilliams@gmail.com",
    icon: Mail,
    external: false,
  },
  {
    name: "GitHub",
    url: "https://github.com/wdonray",
    icon: Github,
    external: true,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/donrayxwilliams/",
    icon: Linkedin,
    external: true,
  },
];

const navLinks = [
  { href: "/#skills", label: "Skills", icon: Code2 },
  { href: "/#projects", label: "Projects", icon: Rocket },
  { href: "/#experience", label: "Experience", icon: Briefcase },
];

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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
      role="banner"
    >
      <div className="px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/#hero"
          className="text-xl font-bold cursor-pointer hover:text-khaki transition-colors flex items-center gap-2"
          aria-label="Go to homepage"
        >
          donray.dev
          <span
            className="wave-emoji text-2xl"
            role="img"
            aria-label="Waving hand"
          >
            👋🏽
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
          id="main-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm px-3 py-2.5 rounded-md hover:text-khaki hover:bg-accent transition-colors"
              aria-label={`View ${link.label.toLowerCase()} section`}
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-2 h-5 w-px bg-border" aria-hidden="true" />

          <div className="flex items-center gap-1">
            {contactLinks.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="icon"
                className="cursor-pointer hover:text-khaki"
                asChild
              >
                <a
                  href={social.url}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  aria-label={
                    social.external
                      ? `Visit ${social.name} profile`
                      : `Contact via ${social.name.toLowerCase()}`
                  }
                >
                  <social.icon className="size-5" aria-hidden="true" />
                </a>
              </Button>
            ))}
          </div>

          <ModeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden" id="mobile-menu">
          <ModeToggle className="size-11" />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11"
                aria-label="Open menu"
              >
                <Menu className="size-5 cursor-pointer" aria-hidden="true" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="w-full h-[80vh]">
              <SheetHeader>
                <SheetTitle>donray.dev</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 mt-6 px-4"
                aria-label="Mobile navigation"
              >
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 text-xl font-bold py-2 hover:text-khaki transition-colors"
                      >
                        <Icon className="size-5" aria-hidden="true" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}

                <div
                  className="my-2 h-px w-full bg-border"
                  aria-hidden="true"
                />

                <div className="flex items-center gap-3">
                  {contactLinks.map((social) => (
                    <Button
                      key={social.name}
                      variant="outline"
                      size="icon"
                      className="cursor-pointer size-11"
                      asChild
                    >
                      <a
                        href={social.url}
                        target={social.external ? "_blank" : undefined}
                        rel={
                          social.external ? "noopener noreferrer" : undefined
                        }
                        aria-label={
                          social.external
                            ? `Visit ${social.name} profile`
                            : `Contact via ${social.name.toLowerCase()}`
                        }
                      >
                        <social.icon className="size-5" aria-hidden="true" />
                      </a>
                    </Button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
