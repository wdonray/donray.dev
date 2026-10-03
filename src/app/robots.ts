import type { MetadataRoute } from "next";

/**
 * Generates /robots.txt. AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
 * are intentionally allowed so the site can be cited in AI answers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: "https://www.donray.dev/sitemap.xml",
  };
}
