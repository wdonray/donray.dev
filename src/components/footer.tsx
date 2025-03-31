"use client";

import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "./ui/button";

const socialLinks = [
  {
    name: "Email",
    url: "mailto:donrayxwilliams@gmail.com",
    icon: Mail,
  },
  {
    name: "GitHub",
    url: "https://github.com/wdonray",
    icon: Github,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/donrayxwilliams/",
    icon: Linkedin,
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t z-50 border-border mt-6 sticky bottom-0 bg-background"
      role="contentinfo"
    >
      <div className="w-full px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Donray Williams
          </div>
          <nav aria-label="Social links">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  asChild
                >
                  <Link
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${social.name} profile`}
                  >
                    <social.icon className="size-5" aria-hidden="true" />
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
