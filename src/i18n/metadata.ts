import { routing, LOCALE_LANG, type AppLocale } from "./routing";

/**
 * hreflang alternates for a locale-agnostic path (e.g. "/blog").
 * `locale` selects the canonical URL for the current page.
 */
export function localeAlternates(path: string, locale: AppLocale) {
  const suffix = path === "/" ? "" : path;
  const languages: Record<string, string> = { "x-default": path };
  for (const l of routing.locales) {
    languages[LOCALE_LANG[l as AppLocale]] =
      l === routing.defaultLocale ? path : `/${l}${suffix}`;
  }
  return {
    canonical: locale === routing.defaultLocale ? path : `/${locale}${suffix}`,
    languages,
  };
}

/** Absolute hreflang URLs for the sitemap. */
export function absoluteLocaleUrls(path: string, baseUrl: string) {
  return routing.locales.map((l) => ({
    locale: l,
    url: `${baseUrl}${l === routing.defaultLocale ? "" : `/${l}`}${
      path === "/" ? "" : path
    }`,
  }));
}
