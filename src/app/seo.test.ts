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
  it("lists the public pages", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://www.donray.dev");
    expect(urls).toContain("https://www.donray.dev/analytics");
    expect(urls).toContain("https://www.donray.dev/version");
  });

  it("prioritizes the homepage", () => {
    const home = sitemap().find(
      (entry) => entry.url === "https://www.donray.dev",
    );
    expect(home?.priority).toBe(1);
  });
});
