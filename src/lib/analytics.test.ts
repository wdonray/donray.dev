import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  __resetClientForTests,
  __resetRateLimitForTests,
  compareDays,
  getConfig,
  getPageUniqueViews,
  isRateLimited,
  recordEngagedVisitor,
  recordPageView,
} from "./analytics";

afterEach(() => {
  __resetClientForTests();
  vi.unstubAllEnvs();
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

describe("recordEngagedVisitor", () => {
  it("returns false without configuration (no DynamoDB calls)", async () => {
    await expect(recordEngagedVisitor("/", "1.2.3.4", "browser")).resolves.toBe(
      false,
    );
  });

  it("returns false for bots", async () => {
    vi.stubEnv("ANALYTICS_TABLE", "t");
    vi.stubEnv("ANALYTICS_AWS_REGION", "us-east-1");
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "k");
    vi.stubEnv("ANALYTICS_AWS_SECRET_ACCESS_KEY", "s");
    vi.stubEnv("ANALYTICS_SALT", "salt");
    await expect(
      recordEngagedVisitor("/", "1.2.3.4", "curl/8.0"),
    ).resolves.toBe(false);
  });

  it("returns false for invalid paths", async () => {
    await expect(
      recordEngagedVisitor("https://evil.com", "1.2.3.4", "browser"),
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
    // 61 seconds later: window has slid past the burst.
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

describe("getPageUniqueViews", () => {
  it("returns null when analytics is not configured", async () => {
    // No ANALYTICS_* env vars set in test env.
    await expect(getPageUniqueViews("/blog/test")).resolves.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* DynamoDB-backed paths, with a mocked document client.               */
/* ------------------------------------------------------------------ */

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getAnalyticsSummary, getPageTotalViews } from "./analytics";

vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/lib-dynamodb")>();
  return { ...actual, DynamoDBDocumentClient: { from: vi.fn() } };
});

const TEST_ENV = {
  ANALYTICS_TABLE: "test-table",
  ANALYTICS_AWS_REGION: "us-east-1",
  ANALYTICS_AWS_ACCESS_KEY_ID: "test-key",
  ANALYTICS_AWS_SECRET_ACCESS_KEY: "test-secret",
  ANALYTICS_SALT: "test-salt",
};

function mockClient(sendImpl: (cmd: unknown) => Promise<unknown>) {
  const send = vi.fn(sendImpl);
  vi.mocked(DynamoDBDocumentClient.from).mockReturnValue({ send } as never);
  return send;
}

function setTestEnv() {
  for (const [k, v] of Object.entries(TEST_ENV)) vi.stubEnv(k, v);
}

describe("recordPageView (with DynamoDB)", () => {
  beforeEach(() => {
    setTestEnv();
    __resetClientForTests();
  });

  it("writes total and daily records only (no uniques)", async () => {
    const send = mockClient(async () => ({}));
    const ok = await recordPageView(
      "/blog/test",
      "1.2.3.4",
      "Mozilla/5.0 Chrome/120",
      new Date("2026-10-03T12:00:00Z"),
    );
    expect(ok).toBe(true);
    // TOTAL + page DAY records. Uniques are written separately via
    // recordEngagedVisitor.
    expect(send).toHaveBeenCalledTimes(2);
    const sks = send.mock.calls.map(
      (call) => (call[0] as { input: { Key: { sk: string } } }).input.Key.sk,
    );
    expect(sks).toContain("TOTAL");
    expect(sks).toContain("DAY#2026-10-03");
    expect(sks).not.toContain("UNIQUES");
    expect(sks).not.toContain("UNIQUES_V2");
  });

  it("reuses the cached client across calls", async () => {
    const send = mockClient(async () => ({}));
    await recordPageView("/a", "1.1.1.1", "Mozilla/5.0", new Date());
    await recordPageView("/b", "1.1.1.1", "Mozilla/5.0", new Date());
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(4);
  });
});

describe("recordEngagedVisitor (with DynamoDB)", () => {
  beforeEach(() => {
    setTestEnv();
    __resetClientForTests();
  });

  it("writes page and site UNIQUES_V2 records", async () => {
    const send = mockClient(async () => ({}));
    const ok = await recordEngagedVisitor(
      "/blog/test",
      "1.2.3.4",
      "Mozilla/5.0 Chrome/120",
    );
    expect(ok).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
    const keys = send.mock.calls.map(
      (call) =>
        (call[0] as { input: { Key: { pk: string; sk: string } } }).input.Key,
    );
    expect(keys).toContainEqual({ pk: "PAGE#/blog/test", sk: "UNIQUES_V2" });
    expect(keys).toContainEqual({ pk: "SITE", sk: "UNIQUES_V2" });
  });

  it("writes the same visitor hash on repeat visits a year apart", async () => {
    const send = mockClient(async () => ({}));
    const ip = "203.0.113.9";
    const ua = "Mozilla/5.0 TestBrowser/1.0";
    await recordEngagedVisitor("/", ip, ua);
    await recordEngagedVisitor("/blog/some-post", ip, ua);
    const uniquesWrites = send.mock.calls.filter(
      (call) =>
        (call[0] as { input: { Key: { sk: string } } }).input.Key.sk ===
        "UNIQUES_V2",
    );
    // Page UNIQUES_V2 + SITE UNIQUES_V2 for each of the two visits.
    expect(uniquesWrites).toHaveLength(4);
    const hashes = uniquesWrites.map(
      (call) =>
        [
          ...(
            call[0] as {
              input: {
                ExpressionAttributeValues: { ":visitor": Set<string> };
              };
            }
          ).input.ExpressionAttributeValues[":visitor"],
        ][0],
    );
    // All four writes carry the identical hash: the visitor counts once.
    expect(new Set(hashes).size).toBe(1);
  });

  it("does not write legacy UNIQUES keys", async () => {
    const send = mockClient(async () => ({}));
    await recordEngagedVisitor("/a", "1.1.1.1", "Mozilla/5.0");
    const sks = send.mock.calls.map(
      (call) => (call[0] as { input: { Key: { sk: string } } }).input.Key.sk,
    );
    expect(sks).not.toContain("UNIQUES");
  });
});

describe("getPageTotalViews (with DynamoDB)", () => {
  beforeEach(() => {
    setTestEnv();
    __resetClientForTests();
  });

  it("returns the stored view count", async () => {
    mockClient(async () => ({ Item: { views: 42 } }));
    await expect(getPageTotalViews("/blog/test")).resolves.toBe(42);
  });

  it("returns 0 when the page has no record", async () => {
    mockClient(async () => ({}));
    await expect(getPageTotalViews("/blog/test")).resolves.toBe(0);
  });

  it("returns null without configuration", async () => {
    vi.unstubAllEnvs();
    __resetClientForTests();
    await expect(getPageTotalViews("/blog/test")).resolves.toBeNull();
  });
});

describe("getPageUniqueViews (with DynamoDB)", () => {
  beforeEach(() => {
    setTestEnv();
    __resetClientForTests();
  });

  /** Mock that returns different items based on the GetCommand key's sk. */
  function mockClientBySk(
    bySk: Record<string, unknown>,
  ): ReturnType<typeof mockClient> {
    return mockClient(async (cmd: unknown) => {
      const sk = (cmd as { input: { Key: { sk: string } } }).input.Key.sk;
      return bySk[sk] ?? {};
    });
  }

  it("reads from both V1 and V2 uniques keys and sums them", async () => {
    const send = mockClientBySk({
      UNIQUES: { Item: { visitors: ["a", "b"] } },
      UNIQUES_V2: { Item: { visitors: ["c", "d", "e"] } },
    });
    await expect(getPageUniqueViews("/blog/test")).resolves.toBe(5);
    const sks = send.mock.calls.map(
      (call) => (call[0] as { input: { Key: { sk: string } } }).input.Key.sk,
    );
    expect(sks).toContain("UNIQUES");
    expect(sks).toContain("UNIQUES_V2");
  });

  it("handles Set visitor collections in both keys", async () => {
    mockClientBySk({
      UNIQUES: { Item: { visitors: new Set(["a", "b"]) } },
      UNIQUES_V2: { Item: { visitors: new Set(["c"]) } },
    });
    await expect(getPageUniqueViews("/blog/test")).resolves.toBe(3);
  });

  it("returns 0 when the page has no uniques records", async () => {
    mockClientBySk({});
    await expect(getPageUniqueViews("/blog/test")).resolves.toBe(0);
  });

  it("sums when only one key exists", async () => {
    mockClientBySk({
      UNIQUES: { Item: { visitors: ["a", "b", "c"] } },
    });
    await expect(getPageUniqueViews("/blog/test")).resolves.toBe(3);
  });
});

describe("getAnalyticsSummary (with DynamoDB)", () => {
  beforeEach(() => {
    setTestEnv();
    __resetClientForTests();
  });

  it("returns null without configuration", async () => {
    vi.unstubAllEnvs();
    __resetClientForTests();
    await expect(getAnalyticsSummary()).resolves.toBeNull();
  });

  it("aggregates totals, daily stats, and V1+V2 uniques", async () => {
    mockClient(async () => ({
      Items: [
        { pk: "PAGE#/blog/a", sk: "TOTAL", path: "/blog/a", views: 100 },
        {
          pk: "PAGE#/blog/a",
          sk: "UNIQUES_V2",
          path: "/blog/a",
          visitors: new Set(["u1", "u2"]),
        },
        // V1 holds pre-cutover history: summed with V2.
        {
          pk: "PAGE#/blog/a",
          sk: "UNIQUES",
          path: "/blog/a",
          visitors: new Set(["legacy1", "legacy2", "legacy3"]),
        },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2026-10-02",
          path: "/blog/a",
          day: "2026-10-02",
          views: 4,
        },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2026-10-01",
          path: "/blog/a",
          day: "2026-10-01",
          views: 2,
        },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2026-10-03",
          path: "/blog/a",
          day: "2026-10-03",
          views: 10,
        },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2026-09-28",
          path: "/blog/a",
          day: "2026-09-28",
          views: 1,
        },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2026-09-30",
          path: "/blog/a",
          day: "2026-09-30",
          views: 5,
        },
        {
          pk: "SITE",
          sk: "UNIQUES_V2",
          visitors: ["u1", "u2", "u3"],
        },
        // SITE V1 key: summed with V2.
        {
          pk: "SITE",
          sk: "UNIQUES",
          visitors: ["legacy1"],
        },
        // UNIQUES_V2 item without a visitors field: counts as 0.
        {
          pk: "PAGE#/blog/b",
          sk: "UNIQUES_V2",
          path: "/blog/b",
        },
        // Legacy day-bound records are ignored by the new read path.
        {
          pk: "SITE",
          sk: "DAY#2026-10-03",
          day: "2026-10-03",
          visitors: ["legacy1", "legacy2"],
        },
      ],
    }));
    const summary = await getAnalyticsSummary(
      30,
      new Date("2026-10-03T12:00:00Z"),
    );
    expect(summary).not.toBeNull();
    expect(summary!.totalViews).toBe(100);
    // SITE: V1 (1) + V2 (3) = 4.
    expect(summary!.totalUniques).toBe(4);
    expect(summary!.pages).toHaveLength(2);
    expect(summary!.pages[0].path).toBe("/blog/a");
    // Page: V1 (3) + V2 (2) = 5.
    expect(summary!.pages[0].uniques).toBe(5);
    expect(summary!.pages[1].path).toBe("/blog/b");
    expect(summary!.pages[1].uniques).toBe(0);
    expect(summary!.dailyTotals).toHaveLength(5);
    // Sorted ascending by day.
    expect(summary!.dailyTotals[0].day).toBe("2026-09-28");
    expect(summary!.dailyTotals[4].day).toBe("2026-10-03");
    expect(summary!.fetchedAt).toBeTruthy();
  });

  it("follows scan pagination", async () => {
    let calls = 0;
    mockClient(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          Items: [{ pk: "PAGE#/x", sk: "TOTAL", path: "/x", views: 5 }],
          LastEvaluatedKey: { pk: "y" },
        };
      }
      return {
        Items: [{ pk: "PAGE#/y", sk: "TOTAL", path: "/y", views: 7 }],
      };
    });
    const summary = await getAnalyticsSummary();
    expect(summary!.totalViews).toBe(12);
    expect(summary!.pages).toHaveLength(2);
  });

  it("ignores items outside the day window", async () => {
    mockClient(async () => ({
      Items: [
        { pk: "PAGE#/blog/a", sk: "TOTAL", path: "/blog/a", views: 50 },
        {
          pk: "PAGE#/blog/a",
          sk: "DAY#2020-01-01",
          path: "/blog/a",
          day: "2020-01-01",
          views: 99,
        },
      ],
    }));
    const summary = await getAnalyticsSummary(
      30,
      new Date("2026-10-03T12:00:00Z"),
    );
    expect(summary!.totalViews).toBe(50);
    expect(summary!.pages[0].daily).toHaveLength(0);
    expect(summary!.pages[0].uniques).toBe(0);
  });

  it("handles missing fields and empty pages", async () => {
    let calls = 0;
    mockClient(async () => {
      calls += 1;
      if (calls === 1) return { LastEvaluatedKey: { pk: "x" } }; // no Items
      return {
        Items: [
          // No path field: falls back to pk slice.
          // No views field: falls back to 0.
          { pk: "PAGE#/blog/b", sk: "TOTAL" },
          { pk: "PAGE#/blog/b", sk: "DAY#2026-10-01", views: 3 },
          // DAY without views: falls back to 0.
          { pk: "PAGE#/blog/b", sk: "DAY#2026-09-29" },
          // No sk at all: sk?.startsWith is undefined.
          { pk: "PAGE#/blog/b" },
          // SITE without DAY sk.
          { pk: "SITE" },
          // SITE with old DAY sk (outside window).
          { pk: "SITE", sk: "DAY#2020-01-01", visitors: ["x"] },
          // Unrecognized pk prefix: skipped.
          { pk: "OTHER", sk: "TOTAL" },
        ],
      };
    });
    const summary = await getAnalyticsSummary(
      30,
      new Date("2026-10-03T12:00:00Z"),
    );
    expect(summary!.totalViews).toBe(0);
    expect(summary!.pages[0].path).toBe("/blog/b");
    expect(summary!.pages[0].totalViews).toBe(0);
  });
});

describe("compareDays", () => {
  it("orders days ascending", () => {
    expect(compareDays({ day: "2026-10-01" }, { day: "2026-10-02" })).toBe(-1);
    expect(compareDays({ day: "2026-10-02" }, { day: "2026-10-01" })).toBe(1);
    expect(compareDays({ day: "2026-10-01" }, { day: "2026-10-01" })).toBe(1);
  });
});
