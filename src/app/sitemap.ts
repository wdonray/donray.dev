import type { MetadataRoute } from "next";
import { absoluteLocaleUrls } from "@/i18n/metadata";
import { PROJECTS } from "@/lib/projects";
import { getPosts } from "@/lib/blog";

const BASE_URL = "https://www.donray.dev";

interface PageEntry {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

/**
 * Generates /sitemap.xml with one URL per locale. The default locale (en)
 * keeps the existing unprefixed URLs; other locales get /es, /zh, /tl.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: PageEntry[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/analytics", changeFrequency: "daily", priority: 0.7 },
    { path: "/version", changeFrequency: "weekly", priority: 0.3 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    ...getPosts().map((post) => ({
      path: `/blog/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { path: "/uses", changeFrequency: "monthly", priority: 0.5 },
    { path: "/principles", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    ...PROJECTS.map((project) => ({
      path: `/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return pages.flatMap((page) =>
    absoluteLocaleUrls(page.path, BASE_URL).map(({ url }) => ({
      url,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );
}
