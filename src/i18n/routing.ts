import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "es", "zh", "tl"] as const;
export type AppLocale = (typeof LOCALES)[number];

/** BCP 47 language tags for <html lang> and hreflang. */
export const LOCALE_LANG: Record<AppLocale, string> = {
  en: "en",
  es: "es",
  zh: "zh-Hans",
  tl: "tl",
};

/** Language names in their own language, for the switcher. */
export const LOCALE_NAMES: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  tl: "Tagalog",
};

export function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: "en",
  // English keeps the existing unprefixed URLs (/, /blog, ...);
  // other locales get a prefix (/es, /zh, /tl).
  localePrefix: "as-needed",
});
