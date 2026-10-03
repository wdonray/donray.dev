import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { POSTS } from "../src/lib/blog";
import { PROJECTS } from "../src/lib/projects";

/**
 * Safety net: every public page must render substantive content.
 * Routes are discovered from the filesystem, so adding a new page
 * without it being tested fails CI automatically. Coverage cannot
 * be silently reduced by forgetting to update a list.
 *
 * Catches the class of bug where a page builds and returns 200
 * but renders an empty shell (e.g. the blank blog post body).
 */
function discoverRoutes(): string[] {
  const appDir = path.join(__dirname, "..", "src", "app");
  const routes: string[] = [];

  if (fs.existsSync(path.join(appDir, "page.tsx"))) {
    routes.push("/");
  }

  function walk(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      // Skip route groups, API routes, and Next.js internals.
      if (entry.name.startsWith("(") || entry.name.startsWith("_")) continue;
      if (entry.name === "api") continue;

      const routePath = `${prefix}/${entry.name}`;
      const fullPath = path.join(dir, entry.name);

      if (fs.existsSync(path.join(fullPath, "page.tsx"))) {
        routes.push(routePath.replace("[slug]", "__SLUG__"));
      }
      walk(fullPath, routePath);
    }
  }

  walk(appDir, "");

  // Expand dynamic [slug] routes from their data sources.
  const expanded: string[] = [];
  for (const route of routes) {
    if (!route.includes("__SLUG__")) {
      expanded.push(route);
      continue;
    }
    const slugs = route.startsWith("/blog")
      ? POSTS.map((p) => p.slug)
      : PROJECTS.map((p) => p.slug);
    for (const slug of slugs) {
      expanded.push(route.replace("__SLUG__", slug));
    }
  }

  return [...new Set(expanded)].sort();
}

const PAGES = discoverRoutes();

test.describe("every page renders content", () => {
  test("route discovery finds all pages", () => {
    // Sanity check: if this list is short, discovery is broken
    // and the safety net has holes.
    expect(PAGES.length).toBeGreaterThanOrEqual(10);
    expect(PAGES).toContain("/");
    expect(PAGES).toContain("/blog");
    expect(PAGES).toContain("/uses");
  });

  for (const pagePath of PAGES) {
    test(`${pagePath} has non-empty main content`, async ({ page }) => {
      const response = await page.goto(pagePath);
      expect(response?.status()).toBe(200);

      const main = page.locator("main, article").first();
      await expect(main).not.toBeEmpty();

      // Substantive, not just chrome: at least a paragraph of text.
      const text = (await main.innerText()).trim();
      expect(text.length).toBeGreaterThan(100);
    });
  }
});
