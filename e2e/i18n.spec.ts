import { test, expect } from "@playwright/test";

test.describe("internationalization", () => {
  test("spanish homepage renders translated copy", async ({ page }) => {
    await page.goto("/es");
    await expect(
      page.getByRole("heading", { name: "Hola, soy Donray" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("chinese homepage renders translated copy", async ({ page }) => {
    await page.goto("/zh");
    await expect(
      page.getByRole("heading", { name: "你好，我是 Donray" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hans");
  });

  test("tagalog homepage renders translated copy", async ({ page }) => {
    await page.goto("/tl");
    await expect(
      page.getByRole("heading", { name: "Hi, ako si Donray" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "tl");
  });

  test("english homepage has no locale prefix", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", { name: "Hi, I'm Donray" }),
    ).toBeVisible();
  });

  test("hreflang alternates cover all locales", async ({ page }) => {
    await page.goto("/es/blog");
    for (const [hreflang, path] of [
      ["x-default", "/blog"],
      ["en", "/blog"],
      ["es", "/es/blog"],
      ["zh-Hans", "/zh/blog"],
      ["tl", "/tl/blog"],
    ]) {
      const link = page.locator(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
      );
      await expect(link).toHaveAttribute(
        "href",
        `https://www.donray.dev${path}`,
      );
    }
  });

  test("language switcher navigates between locales", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Choose a language" }).click();
    await page.getByRole("menuitem", { name: "Español" }).click();
    await expect(page).toHaveURL("/es");
    await expect(
      page.getByRole("heading", { name: "Hola, soy Donray" }),
    ).toBeVisible();
  });

  test("blog post body stays in English on localized pages", async ({
    page,
  }) => {
    await page.goto("/es/blog/review-to-learn");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // The post title and body remain English; only the chrome is translated.
    await expect(
      page.getByRole("heading", {
        name: "The best code review I did as a manager proved me wrong",
      }),
    ).toBeVisible();
    const article = page.locator("article");
    await expect(article).toContainText("For a stretch this fall");
    // The UI chrome around it is Spanish.
    await expect(page.locator("main")).toContainText(
      "Los artículos están escritos en inglés.",
    );
  });

  test("unknown locale returns 404", async ({ page }) => {
    const response = await page.goto("/xx");
    expect(response?.status()).toBe(404);
  });
});
