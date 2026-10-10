"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Coffee, Mail } from "lucide-react";
import { Github, Linkedin } from "./ui/brand-icons";
import { Button } from "./ui/button";

interface SocialLink {
  name: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  ariaLabelKey?: "buyMeACoffee";
}

const socialLinks: SocialLink[] = [
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
  {
    name: "Buy me a coffee",
    url: "https://buymeacoffee.com/donrayxwils",
    icon: Coffee,
    ariaLabelKey: "buyMeACoffee",
  },
];

const footerNavKeys = [
  "principles",
  "analytics",
  "version",
  "privacy",
  "terms",
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="w-full px-4 md:px-8 py-6 md:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4">
          <div className="text-sm text-muted-foreground">
            {t("copyright", { year })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-4">
            {footerNavKeys.map((key) => (
              <Link
                key={key}
                href={`/${key}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(`nav.${key}`)}
              </Link>
            ))}
            <nav aria-label={t("socialLinks")}>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    className="cursor-pointer size-11"
                    asChild
                  >
                    <Link
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        social.ariaLabelKey
                          ? t(social.ariaLabelKey)
                          : t("visitProfile", { name: social.name })
                      }
                    >
                      <social.icon className="size-5" aria-hidden="true" />
                    </Link>
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
