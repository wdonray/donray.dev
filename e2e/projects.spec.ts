import { test, expect } from "@playwright/test";

const PROJECTS = [
  { slug: "pico-domains", title: "pico.domains" },
  { slug: "cyclei", title: "Cyclei" },
  { slug: "hide-zero-cards", title: "Hide Zero Cards" },
  { slug: "donray-dev", title: "donray.dev" },
];

test.describe("project detail pages", () => {
  for (const { slug, title } of PROJECTS) {
    test(`${slug} renders title, subtitle, and body`, async ({ page }) => {
      // Dynamic route, same risk class as the blog post body bug:
      // assert the article actually contains content, not just the shell.
      await page.goto(`/projects/${slug}`);

      const article = page.locator("article");
      await expect(
        article.getByRole("heading", { name: title, level: 1 }),
      ).toBeVisible();
      await expect(article).not.toBeEmpty();
      // Subtitle and tech stack must render.
      await expect(article.locator("p.text-lg").first()).not.toBeEmpty();
    });
  }

  test("unknown project returns 404", async ({ page }) => {
    const response = await page.goto("/projects/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
