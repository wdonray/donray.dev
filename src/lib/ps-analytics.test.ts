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
  __resetPsCacheForTests,
  __resetPsClientForTests,
  getPsConfig,
  getPsStats,
} from "./ps-analytics";

const ENV = {
  PS_ANALYTICS_TABLE: "ps-analytics-table",
  ANALYTICS_AWS_REGION: "us-east-1",
  ANALYTICS_AWS_ACCESS_KEY_ID: "key",
  ANALYTICS_AWS_SECRET_ACCESS_KEY: "secret",
};

function stubPsEnv() {
  for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
}

beforeEach(() => {
  stubPsEnv();
});

afterEach(() => {
  __resetPsClientForTests();
  __resetPsCacheForTests();
  vi.unstubAllEnvs();
});

describe("getPsConfig", () => {
  it("returns the table plus shared region and credentials", () => {
    expect(getPsConfig()).toEqual({
      table: "ps-analytics-table",
      region: "us-east-1",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });
  });

  it("returns null when the HZC table is not configured", () => {
    vi.stubEnv("PS_ANALYTICS_TABLE", "");
    expect(getPsConfig()).toBeNull();
  });

  it("returns null when shared credentials are missing", () => {
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "");
    expect(getPsConfig()).toBeNull();
  });
});

describe("getPsStats", () => {
  it("returns null without touching DynamoDB when unconfigured", async () => {
    vi.stubEnv("PS_ANALYTICS_TABLE", "");
    const send = mockClient(async () => ({}));
    expect(await getPsStats()).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("sums page totals and counts site-wide uniques", async () => {
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
      ],
    }));
    expect(await getPsStats()).toEqual({
      pageViews: 10,
      uniqueVisitors: 4,
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
    expect(await getPsStats()).toEqual({
      pageViews: 7,
      uniqueVisitors: 1,
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("treats a missing uniques set as zero", async () => {
    mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 1 }],
    }));
    expect(await getPsStats()).toEqual({
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
    expect(await getPsStats()).toEqual({
      pageViews: 0,
      uniqueVisitors: 0,
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("caches results for five minutes", async () => {
    const send = mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 9 }],
    }));
    const first = await getPsStats(1_000);
    const second = await getPsStats(1_000 + 4 * 60 * 1000);
    expect(second).toBe(first);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after the cache expires", async () => {
    const send = mockClient(async () => ({
      Items: [{ pk: "PAGE#/", sk: "TOTAL", views: 9 }],
    }));
    await getPsStats(1_000);
    await getPsStats(1_000 + 6 * 60 * 1000);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
