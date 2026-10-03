import { readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const { version } = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8"),
) as { version: string };

const RELEASES_URL = "https://api.github.com/repos/wdonray/donray.dev/releases";

function mockReleases(tags: string[]) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(
      tags.map((tag) => ({
        tag_name: tag,
        html_url: `https://github.com/wdonray/donray.dev/releases/tag/${tag}`,
        published_at: "2026-10-03T11:00:00Z",
        body: `### Tests\n\n  - Some change (abc1234)\n`,
      })),
    ),
  };
}

test.describe("/version page", () => {
  test("shows the heading, live indicator, and current build", async ({
    page,
  }) => {
    await page.goto("/version");

    await expect(page.getByRole("heading", { name: "Version" })).toBeVisible();
    await expect(
      page.getByText("This build", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText(`v${version}`, { exact: true })).toBeVisible();
    await expect(page.getByText(/Live/)).toBeVisible();
  });

  test("lists recent releases with the newest marked Latest", async ({
    page,
  }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases(["v0.6.0", "v0.5.9"])),
    );
    await page.goto("/version");

    await expect(page.getByText("v0.6.0", { exact: true })).toBeVisible();
    await expect(page.getByText("Latest")).toBeVisible();
    await expect(page.getByText("v0.5.9", { exact: true })).toBeVisible();
    await expect(page.getByText("Some change").first()).toBeVisible();
  });

  test("marks the running build in the release list", async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases([`v${version}`, "v0.5.9"])),
    );
    await page.goto("/version");

    // Header label plus the badge on the matching release card.
    await expect(page.getByText("This build", { exact: true })).toHaveCount(2);
  });

  test("shows a warning when GitHub is unreachable", async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.abort(),
    );
    await page.goto("/version");

    await expect(
      page.getByText("Couldn't reach GitHub. Showing last known releases."),
    ).toBeVisible();
  });
});
