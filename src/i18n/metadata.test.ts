import { describe, expect, it } from "vitest";
import { localeAlternates, absoluteLocaleUrls } from "./metadata";

describe("localeAlternates", () => {
  it("builds hreflang alternates for a path", () => {
    const result = localeAlternates("/blog", "en");
    expect(result.canonical).toBe("/blog");
    expect(result.languages).toEqual({
      "x-default": "/blog",
      en: "/blog",
      es: "/es/blog",
      "zh-Hans": "/zh/blog",
      tl: "/tl/blog",
    });
  });

  it("uses the localized path as canonical for non-default locales", () => {
    const result = localeAlternates("/blog", "es");
    expect(result.canonical).toBe("/es/blog");
    expect(result.languages["x-default"]).toBe("/blog");
  });

  it("handles the root path", () => {
    const result = localeAlternates("/", "zh");
    expect(result.canonical).toBe("/zh");
    expect(result.languages.en).toBe("/");
    expect(result.languages["zh-Hans"]).toBe("/zh");
  });
});

describe("absoluteLocaleUrls", () => {
  it("prefixes non-default locales", () => {
    const urls = absoluteLocaleUrls("/analytics", "https://www.donray.dev");
    expect(urls.map((u) => u.url)).toEqual([
      "https://www.donray.dev/analytics",
      "https://www.donray.dev/es/analytics",
      "https://www.donray.dev/zh/analytics",
      "https://www.donray.dev/tl/analytics",
    ]);
  });

  it("omits the trailing slash for the root path", () => {
    const urls = absoluteLocaleUrls("/", "https://www.donray.dev");
    expect(urls.map((u) => u.url)).toEqual([
      "https://www.donray.dev",
      "https://www.donray.dev/es",
      "https://www.donray.dev/zh",
      "https://www.donray.dev/tl",
    ]);
  });
});
