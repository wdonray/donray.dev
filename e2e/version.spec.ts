import { readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const { version } = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8"),
) as { version: string };

const RELEASES_API =
  "https://api.github.com/repos/wdonray/donray.dev/releases/latest";

function mockRelease(tagName: string, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({
      tag_name: tagName,
      html_url: "https://github.com/wdonray/donray.dev/releases",
      published_at: "2026-10-01T12:00:00Z",
    }),
  };
}

test.describe("/version page", () => {
  test("shows the current build version", async ({ page }) => {
    await page.goto("/version");

    await expect(page.getByRole("heading", { name: "Version" })).toBeVisible();
    await expect(page.getByText("This build")).toBeVisible();
    await expect(page.getByText(`v${version}`, { exact: true })).toBeVisible();
  });

  test("check again reports up-to-date when versions match", async ({
    page,
  }) => {
    await page.route(RELEASES_API, (route) =>
      route.fulfill(mockRelease(`v${version}`)),
    );
    await page.goto("/version");

    await page.getByRole("button", { name: /check again/i }).click();

    await expect(page.getByText("You're on the latest release.")).toBeVisible();
  });

  test("check again reports when a newer release exists", async ({ page }) => {
    await page.route(RELEASES_API, (route) =>
      route.fulfill(mockRelease("v99.0.0")),
    );
    await page.goto("/version");

    await page.getByRole("button", { name: /check again/i }).click();

    await expect(page.getByText("A newer release is available.")).toBeVisible();
  });

  test("check again handles GitHub errors", async ({ page }) => {
    await page.route(RELEASES_API, (route) => route.abort());
    await page.goto("/version");

    await page.getByRole("button", { name: /check again/i }).click();

    await expect(
      page.getByText("Couldn't reach GitHub to compare versions."),
    ).toBeVisible();
  });
});
