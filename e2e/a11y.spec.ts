import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated WCAG 2.2 AA scan of every page, powered by axe-core
 * (the same engine behind Lighthouse accessibility audits).
 * Catches: missing labels, contrast failures, landmark/heading issues,
 * keyboard/focus problems, ARIA misuse, and more.
 *
 * Every page is scanned in both light and dark mode, since color
 * contrast is theme-dependent.
 */
test.describe("accessibility", () => {
  const pages = ["/", "/version", "/blog", "/analytics", "/uses"];

  for (const path of pages) {
    for (const theme of ["light", "dark"] as const) {
      test(`${path === "/" ? "home" : path} page has no WCAG 2.2 AA violations in ${theme} mode`, async ({
        page,
      }) => {
        await page.goto(path);
        // Entrance animations (framer-motion) fade content in from opacity 0.
        // Contrast must be measured on the final rendered state, not mid-animation.
        await page.waitForTimeout(1500);

        if (theme === "dark") {
          await page.getByRole("button", { name: "Toggle theme" }).click();
          await page.waitForTimeout(1000);
        }

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  }
});
