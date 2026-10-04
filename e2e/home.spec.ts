import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders the hero", async ({ page }) => {
    await page.goto("/");

    const hero = page.getByRole("region", { name: /hi, i'm donray williams/i });
    await expect(
      hero.getByRole("heading", { name: /hi, i'm donray williams/i }),
    ).toBeVisible();
    await expect(
      hero.getByRole("heading", { name: "Engineering Manager" }),
    ).toBeVisible();

    const resume = hero.getByRole("link", { name: "View Resume" });
    await expect(resume).toHaveAttribute(
      "href",
      "https://donray-public.s3.us-east-1.amazonaws.com/Donray+Williams+Frontend+Engineer.pdf",
    );
    await expect(
      hero.getByRole("link", { name: "Contact via email" }),
    ).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });

  test("header nav scrolls to each section", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "View skills section" }).click();
    await expect(page).toHaveURL(/#skills/);
    await expect(
      page.getByRole("heading", { name: "Skills & Expertise" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "View projects section" }).click();
    await expect(page).toHaveURL(/#projects/);
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    await page.getByRole("link", { name: "View experience section" }).click();
    await expect(page).toHaveURL(/#experience/);
    await expect(
      page.getByRole("heading", { name: "Experience" }),
    ).toBeVisible();
  });

  test("toggles the color theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: "Toggle theme" }).first();

    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    await toggle.click();
    await expect(html).toHaveClass(/light/);
  });

  test("experience expands to show earlier roles", async ({ page }) => {
    await page.goto("/");

    const gemvision = page.getByRole("heading", {
      name: "Gemvision Corporation",
    });
    await expect(gemvision).toHaveCount(0);

    await page
      .getByRole("button", { name: /view earlier experience/i })
      .click();
    await expect(gemvision).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Buh! Gaming" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /hide earlier experience/i })
      .click();
    await expect(gemvision).toHaveCount(0);
  });

  test("project cards link to their destinations", async ({ page }) => {
    await page.goto("/");

    const siteLinks = page.getByRole("link", { name: /visit site/i });
    await expect(siteLinks.filter({ hasText: "" }).first()).toBeVisible();
    const hrefs = await siteLinks.evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(hrefs).toContain("https://hidezerocards.org");

    const githubLinks = page.getByRole("link", { name: /view on github/i });
    const ghHrefs = await githubLinks.evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(ghHrefs).toContain("https://github.com/wdonray/donray.dev");
  });

  test("footer shows the current year", async ({ page }) => {
    await page.goto("/");
    const year = new Date().getFullYear();
    await expect(page.getByText(`© ${year} Donray Williams`)).toBeVisible();
  });

  test("mobile menu opens the navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Projects" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Visit GitHub profile" }),
    ).toBeVisible();
  });
});
