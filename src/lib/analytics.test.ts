import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  __resetClientForTests,
  __resetRateLimitForTests,
  clientIpFromHeaders,
  dayKey,
  getConfig,
  hashVisitor,
  isBot,
  isRateLimited,
  normalizePath,
  recordPageView,
} from "./analytics";

afterEach(() => {
  __resetClientForTests();
  vi.unstubAllEnvs();
});

describe("isBot", () => {
  it("flags common crawlers", () => {
    expect(
      isBot(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("AhrefsBot/7.0")).toBe(true);
  });

  it("passes real browsers", () => {
    expect(
      isBot(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      ),
    ).toBe(false);
    expect(isBot("")).toBe(false);
    expect(isBot(null)).toBe(false);
    expect(isBot(undefined)).toBe(false);
  });
});

describe("normalizePath", () => {
  it("accepts site-relative paths", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/version")).toBe("/version");
    expect(normalizePath("  /analytics  ")).toBe("/analytics");
  });

  it("rejects junk", () => {
    expect(normalizePath(null)).toBeNull();
    expect(normalizePath("")).toBeNull();
    expect(normalizePath("https://evil.com")).toBeNull();
    expect(normalizePath("/page?x=1")).toBeNull();
    expect(normalizePath("/page#frag")).toBeNull();
    expect(normalizePath("/<script>")).toBeNull();
    expect(normalizePath(`/${"a".repeat(300)}`)).toBeNull();
  });
});

describe("dayKey", () => {
  it("formats as yyyy-mm-dd UTC", () => {
    expect(dayKey(new Date("2026-10-02T23:30:00Z"))).toBe("2026-10-02");
  });
});

describe("hashVisitor", () => {
  it("is deterministic for the same inputs", () => {
    const a = hashVisitor("salt", "1.2.3.4", "ua", "2026-10-02");
    const b = hashVisitor("salt", "1.2.3.4", "ua", "2026-10-02");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("changes with salt, ip, ua, or day", () => {
    const base = hashVisitor("salt", "1.2.3.4", "ua", "2026-10-02");
    expect(hashVisitor("other", "1.2.3.4", "ua", "2026-10-02")).not.toBe(base);
    expect(hashVisitor("salt", "5.6.7.8", "ua", "2026-10-02")).not.toBe(base);
    expect(hashVisitor("salt", "1.2.3.4", "other", "2026-10-02")).not.toBe(
      base,
    );
    expect(hashVisitor("salt", "1.2.3.4", "ua", "2026-10-03")).not.toBe(base);
  });

  it("does not leak the ip", () => {
    const hash = hashVisitor("salt", "1.2.3.4", "ua", "2026-10-02");
    expect(hash).not.toContain("1.2.3.4");
  });
});

describe("clientIpFromHeaders", () => {
  it("takes the first x-forwarded-for entry", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18",
    });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(clientIpFromHeaders(new Headers())).toBe("unknown");
    expect(
      clientIpFromHeaders(new Headers({ "x-real-ip": "198.51.100.9" })),
    ).toBe("198.51.100.9");
  });

  it("works with plain record headers", () => {
    expect(clientIpFromHeaders({ "x-forwarded-for": "203.0.113.7" })).toBe(
      "203.0.113.7",
    );
  });
});

describe("getConfig", () => {
  it("returns null when env vars are missing", () => {
    expect(getConfig()).toBeNull();
  });

  it("returns config when all vars are set", () => {
    vi.stubEnv("ANALYTICS_TABLE", "t");
    vi.stubEnv("ANALYTICS_AWS_REGION", "us-east-1");
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "k");
    vi.stubEnv("ANALYTICS_AWS_SECRET_ACCESS_KEY", "s");
    vi.stubEnv("ANALYTICS_SALT", "salt");
    expect(getConfig()).toEqual({
      table: "t",
      region: "us-east-1",
      accessKeyId: "k",
      secretAccessKey: "s",
      salt: "salt",
    });
  });
});

describe("recordPageView", () => {
  it("returns false without configuration (no DynamoDB calls)", async () => {
    await expect(recordPageView("/", "1.2.3.4", "browser")).resolves.toBe(
      false,
    );
  });

  it("returns false for bots", async () => {
    vi.stubEnv("ANALYTICS_TABLE", "t");
    vi.stubEnv("ANALYTICS_AWS_REGION", "us-east-1");
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "k");
    vi.stubEnv("ANALYTICS_AWS_SECRET_ACCESS_KEY", "s");
    vi.stubEnv("ANALYTICS_SALT", "salt");
    await expect(recordPageView("/", "1.2.3.4", "Googlebot/2.1")).resolves.toBe(
      false,
    );
  });

  it("returns false for invalid paths", async () => {
    await expect(
      recordPageView("https://evil.com", "1.2.3.4", "browser"),
    ).resolves.toBe(false);
  });
});

describe("isRateLimited", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 60; i++) {
      expect(isRateLimited("test-key", 1000 + i)).toBe(false);
    }
  });

  it("blocks the 61st request within a minute", () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited("test-key", 1000 + i);
    }
    expect(isRateLimited("test-key", 2000)).toBe(true);
  });

  it("resets after the window passes", () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited("test-key", 1000 + i);
    }
    expect(isRateLimited("test-key", 2000)).toBe(true);
    // 61 seconds later — window has slid past the burst.
    expect(isRateLimited("test-key", 62_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited("key-a", 1000 + i);
    }
    expect(isRateLimited("key-a", 2000)).toBe(true);
    expect(isRateLimited("key-b", 2000)).toBe(false);
  });
});
