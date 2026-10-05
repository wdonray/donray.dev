import type { MetadataRoute } from "next";

const BASE_URL = "https://www.donray.dev";

/**
 * Generates /sitemap.xml. Update this list when adding public pages
 * (e.g. /blog, /uses, /work/*).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/analytics`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/version`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog/review-to-learn`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/uses`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/principles`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...["pico-domains", "cyclei", "hide-zero-cards", "donray-dev"].map(
      (slug) => ({
        url: `${BASE_URL}/projects/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }),
    ),
  ];
}
