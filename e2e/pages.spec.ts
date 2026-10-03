import { test, expect } from "@playwright/test";

/**
 * Safety net: every public page must render substantive content.
 * Catches the class of bug where a page builds and returns 200
 * but renders an empty shell (e.g. the blank blog post body).
 * Add new routes to PAGES when they are created.
 */
const PAGES = [
  "/",
  "/blog",
  "/blog/422-code-reviews",
  "/projects/cyclei",
  "/projects/pico-domains",
  "/projects/hide-zero-cards",
  "/projects/donray-dev",
  "/uses",
  "/analytics",
  "/version",
];

test.describe("every page renders content", () => {
  for (const path of PAGES) {
    test(`${path} has non-empty main content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const main = page.locator("main, article").first();
      await expect(main).not.toBeEmpty();

      // Substantive, not just chrome: at least a paragraph of text.
      const text = (await main.innerText()).trim();
      expect(text.length).toBeGreaterThan(100);
    });
  }
});
