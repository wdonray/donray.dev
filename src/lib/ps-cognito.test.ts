import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* DynamoDB-backed signup count, with a mocked document client.        */
/* ------------------------------------------------------------------ */

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/lib-dynamodb")>();
  return { ...actual, DynamoDBDocumentClient: { from: vi.fn() } };
});

function mockDynamoDb(sendImpl: (cmd: unknown) => Promise<unknown>) {
  const send = vi.fn(sendImpl);
  vi.mocked(DynamoDBDocumentClient.from).mockReturnValue({ send } as never);
  return send;
}

import {
  __resetPsCognitoClientForTests,
  __resetPsSignupCacheForTests,
  getPsCognitoConfig,
  getPsSignupCount,
} from "./ps-cognito";

const ENV = {
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
  __resetPsCognitoClientForTests();
  __resetPsSignupCacheForTests();
  vi.unstubAllEnvs();
});

describe("getPsCognitoConfig", () => {
  it("returns the table plus shared region and credentials", () => {
    expect(getPsCognitoConfig()).toEqual({
      table: "c-shepherd-users",
      region: "us-east-1",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });
  });

  it("honors a custom table name", () => {
    vi.stubEnv("PS_USERS_TABLE", "custom-table");
    expect(getPsCognitoConfig()?.table).toBe("custom-table");
  });

  it("returns null when credentials are not configured", () => {
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "");
    expect(getPsCognitoConfig()).toBeNull();
  });
});

describe("getPsSignupCount", () => {
  it("returns null when not configured", async () => {
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "");
    expect(await getPsSignupCount()).toBeNull();
  });

  it("counts users via Scan", async () => {
    const send = mockDynamoDb(async () => ({ Count: 2 }));
    expect(await getPsSignupCount()).toBe(2);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("paginates through Scan results", async () => {
    const send = mockDynamoDb(async (cmd: unknown) => {
      const token = (cmd as { input: { ExclusiveStartKey?: unknown } }).input
        .ExclusiveStartKey;
      if (!token) {
        return { Count: 60, LastEvaluatedKey: { PK: "x" } };
      }
      return { Count: 5 };
    });
    expect(await getPsSignupCount()).toBe(65);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("returns 0 for an empty table", async () => {
    mockDynamoDb(async () => ({ Count: 0 }));
    expect(await getPsSignupCount()).toBe(0);
  });

  it("shares an in-flight request across concurrent callers", async () => {
    let resolveSend!: (value: unknown) => void;
    const send = mockDynamoDb(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    const p1 = getPsSignupCount();
    const p2 = getPsSignupCount();
    resolveSend({ Count: 1 });
    expect(await p1).toBe(1);
    expect(await p2).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("caches the count for 5 minutes", async () => {
    const send = mockDynamoDb(async () => ({ Count: 1 }));
    expect(await getPsSignupCount(1000)).toBe(1);
    expect(await getPsSignupCount(1000 + 4 * 60 * 1000)).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(await getPsSignupCount(1000 + 6 * 60 * 1000)).toBe(1);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
