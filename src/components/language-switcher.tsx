"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_NAMES, type AppLocale } from "@/i18n/routing";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("languageSwitcher");
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: AppLocale) => {
    if (next !== current) router.replace(pathname, { locale: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("cursor-pointer size-11", className)}
          aria-label={t("chooseLanguage")}
        >
          <Globe className="size-5" aria-hidden="true" />
          <span className="sr-only">{t("chooseLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label={t("label")}>
        {LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <DropdownMenuItem
              key={locale}
              onSelect={() => switchLocale(locale)}
              className="min-h-11 text-base cursor-pointer"
              aria-current={active ? "true" : undefined}
            >
              <span className="flex-1">{LOCALE_NAMES[locale]}</span>
              {active && <Check className="size-4" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
