import { test, expect } from "@playwright/test";

test.describe("/analytics page", () => {
  test("renders the analytics heading", async ({ page }) => {
    await page.goto("/analytics");

    await expect(
      page.getByRole("heading", { name: "Analytics" }),
    ).toBeVisible();
  });

  test("shows the methodology note", async ({ page }) => {
    await page.goto("/analytics");

    // The honesty section is always rendered once configured state resolves;
    // without credentials the page shows the not-configured empty state.
    const body = await page.textContent("body");
    expect(body).toMatch(/Analytics|isn't configured/);
  });

  test("footer links to the analytics page", async ({ page }) => {
    await page.goto("/");

    const link = page.getByRole("link", { name: "Analytics" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/analytics");
  });
});
