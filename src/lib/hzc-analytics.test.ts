import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* DynamoDB-backed paths, with a mocked document client.               */
/* ------------------------------------------------------------------ */

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/lib-dynamodb")>();
  return { ...actual, DynamoDBDocumentClient: { from: vi.fn() } };
});

function mockClient(sendImpl: (cmd: unknown) => Promise<unknown>) {
  const send = vi.fn(sendImpl);
  vi.mocked(DynamoDBDocumentClient.from).mockReturnValue({ send } as never);
  return send;
}

import {
  __resetHzcCacheForTests,
  __resetHzcClientForTests,
  getHzcConfig,
  getHzcStats,
} from "./hzc-analytics";

const ENV = {
  HZC_ANALYTICS_TABLE: "hzc-analytics",
  ANALYTICS_AWS_REGION: "us-east-1",
  ANALYTICS_AWS_ACCESS_KEY_ID: "key",
  ANALYTICS_AWS_SECRET_ACCESS_KEY: "secret",
};

function stubHzcEnv() {
  for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
}

beforeEach(() => {
  stubHzcEnv();
});

afterEach(() => {
  __resetHzcClientForTests();
  __resetHzcCacheForTests();
  vi.unstubAllEnvs();
});

describe("getHzcConfig", () => {
  it("returns the table plus shared region and credentials", () => {
    expect(getHzcConfig()).toEqual({
      table: "hzc-analytics",
      region: "us-east-1",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });
  });

  it("returns null when the HZC table is not configured", () => {
    vi.stubEnv("HZC_ANALYTICS_TABLE", "");
    expect(getHzcConfig()).toBeNull();
  });

  it("returns null when shared credentials are missing", () => {
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "");
    expect(getHzcConfig()).toBeNull();
  });
});

describe("getHzcStats", () => {
  it("returns null without touching DynamoDB when unconfigured", async () => {
    vi.stubEnv("HZC_ANALYTICS_TABLE", "");
    const send = mockClient(async () => ({}));
    expect(await getHzcStats()).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("sums page totals and V1+V2 site-wide uniques", async () => {
    mockClient(async () => ({
      Items: [
        { pk: "PAGE#/", sk: "TOTAL", views: 7 },
        { pk: "PAGE#/", sk: "DAY#2026-10-06", views: 7 },
        { pk: "PAGE#/", sk: "UNIQUES_V2", visitors: ["a", "b"] },
        { pk: "PAGE#/analytics", sk: "TOTAL", views: 3 },
        {
          pk: "SITE",
          sk: "UNIQUES_V2",
          visitors: new Set(["a", "b", "c", "d"]),
        },
        // V1 holds pre-cutover history: summed with V2.
        {
          pk: "SITE",
          sk: "UNIQUES",
          visitors: ["legacy1", "legacy2"],
        },
      ],
    }));
    expect(await getHzcStats()).toEqual({
      pageViews: 10,
      // V1 (2) + V2 (4) = 6.
      uniqueVisitors: 6,
    });
  });

  it("follows scan pagination", async () => {
    const send = mockClient(async (cmd: unknown) => {
      const exclusiveStartKey = (
        cmd as { input: { ExclusiveStartKey?: unknown } }
      ).input.ExclusiveStartKey;
      if (!exclusiveStartKey) {
        return {
          Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 5 }],
          LastEvaluatedKey: { pk: "PAGE#/" },
        };
      }
      return {
        Items: [
          { pk: "PAGE#/x", sk: "TOTAL", views: 2 },
          { pk: "SITE", sk: "UNIQUES_V2", visitors: ["a"] },
        ],
      };
    });
    expect(await getHzcStats()).toEqual({
      pageViews: 7,
      uniqueVisitors: 1,
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("treats a missing uniques set as zero", async () => {
    mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 1 }],
    }));
    expect(await getHzcStats()).toEqual({
      pageViews: 1,
      uniqueVisitors: 0,
    });
  });

  it("handles missing fields defensively", async () => {
    const send = mockClient(async (cmd: unknown) => {
      const exclusiveStartKey = (
        cmd as { input: { ExclusiveStartKey?: unknown } }
      ).input.ExclusiveStartKey;
      if (!exclusiveStartKey) {
        return {
          Items: [
            { pk: "SITE", sk: "UNIQUES_V2" },
            { pk: "PAGE#/", sk: "TOTAL" },
          ],
          LastEvaluatedKey: { pk: "PAGE#/" },
        };
      }
      return {};
    });
    expect(await getHzcStats()).toEqual({
      pageViews: 0,
      uniqueVisitors: 0,
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("caches results for five minutes", async () => {
    const send = mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 9 }],
    }));
    const first = await getHzcStats(1_000);
    const second = await getHzcStats(1_000 + 4 * 60 * 1000);
    expect(second).toBe(first);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after the cache expires", async () => {
    const send = mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 9 }],
    }));
    await getHzcStats(1_000);
    await getHzcStats(1_000 + 6 * 60 * 1000);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
