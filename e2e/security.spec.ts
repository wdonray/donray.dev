import { test, expect } from "@playwright/test";

/**
 * Security headers: every response must carry the hardening headers
 * configured in next.config.ts (HSTS, CSP, frame denial, etc.).
 */
test.describe("security headers", () => {
  const expected = [
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "content-security-policy",
  ];

  for (const path of ["/", "/analytics", "/blog", "/uses"]) {
    test(`${path} serves security headers`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();
      const headers = response!.headers();
      for (const name of expected) {
        expect(headers[name], `${name} on ${path}`).toBeTruthy();
      }
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["content-security-policy"]).toContain(
        "frame-ancestors 'none'",
      );
      // The /version page retries the GitHub release lookup from the
      // browser, so api.github.com must be an allowed connect-src.
      expect(headers["content-security-policy"]).toContain(
        "connect-src 'self' https://api.github.com",
      );
    });
  }
});
