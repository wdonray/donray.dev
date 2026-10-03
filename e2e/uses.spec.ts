import { test, expect } from "@playwright/test";

test.describe("uses page", () => {
  test("renders tool groups with items", async ({ page }) => {
    await page.goto("/uses");

    await expect(
      page.getByRole("heading", { name: "Uses", level: 1 }),
    ).toBeVisible();

    // Every group must render with at least one item; a data or
    // rendering regression that empties the page fails here.
    const groups = ["Editors & AI", "Languages", "Frontend"];
    for (const name of groups) {
      const section = page.getByRole("region", { name });
      await expect(section).toBeVisible();
      await expect(section.locator("dt").first()).not.toBeEmpty();
    }

    await expect(page.locator("main, article").first()).not.toBeEmpty();
  });
});
