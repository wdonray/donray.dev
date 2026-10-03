import { test, expect } from "@playwright/test";

test.describe("blog post page", () => {
  test("renders the article body, not just the header", async ({ page }) => {
    // Regression test: passing a pre-serialized MDX result to
    // next-mdx-remote/rsc's MDXRemote produced an empty article body
    // with no build error. The header, TOC, and metadata all rendered
    // fine, so assert on the body content itself.
    await page.goto("/blog/review-to-learn");

    const article = page.locator("article");
    await expect(article.getByRole("heading", { level: 1 })).toContainText(
      "proved me wrong",
    );

    const body = article.locator("div.mt-4");
    await expect(body).not.toBeEmpty();
    await expect(body).toContainText(
      "Should engineering managers stay in code review",
    );
    // Body headings should render as real headings with anchors.
    await expect(
      body.getByRole("heading", {
        name: "What does a review catch that nothing else does?",
      }),
    ).toBeVisible();
  });

  test("blog index links to the post", async ({ page }) => {
    await page.goto("/blog");

    const link = page.getByRole("link", { name: /proved me wrong/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/blog/review-to-learn");
  });
});
