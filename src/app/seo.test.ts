import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("robots.txt", () => {
  it("allows all crawlers and disallows /api/", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toBe("/api/");
  });

  it("does not block AI crawlers", () => {
    const result = robots();
    const text = JSON.stringify(result);
    expect(text).not.toMatch(/GPTBot|ClaudeBot|PerplexityBot/);
  });

  it("points to the sitemap", () => {
    expect(robots().sitemap).toBe("https://www.donray.dev/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  it("lists the public pages in every locale", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const page of [
      "",
      "/analytics",
      "/version",
      "/blog",
      "/uses",
      "/principles",
      "/privacy",
      "/terms",
      "/projects/cyclei",
      "/projects/patternspell",
      "/projects/donray-dev",
    ]) {
      expect(urls).toContain(`https://www.donray.dev${page}`);
      expect(urls).toContain(`https://www.donray.dev/es${page}`);
      expect(urls).toContain(`https://www.donray.dev/zh${page}`);
      expect(urls).toContain(`https://www.donray.dev/tl${page}`);
    }
  });

  it("includes every blog post", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://www.donray.dev/blog/review-to-learn");
    expect(urls).toContain("https://www.donray.dev/es/blog/review-to-learn");
  });

  it("prioritizes the homepage", () => {
    const home = sitemap().find(
      (entry) => entry.url === "https://www.donray.dev",
    );
    expect(home?.priority).toBe(1);
  });
});
