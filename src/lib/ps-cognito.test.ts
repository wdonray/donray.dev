import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Cognito-backed signup count, with a mocked identity provider client.*/
/* ------------------------------------------------------------------ */

import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

vi.mock("@aws-sdk/client-cognito-identity-provider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@aws-sdk/client-cognito-identity-provider")
    >();
  return { ...actual, CognitoIdentityProviderClient: vi.fn() };
});

vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
}));

function mockCognito(sendImpl: (cmd: unknown) => Promise<unknown>) {
  const send = vi.fn(sendImpl);
  vi.mocked(CognitoIdentityProviderClient).mockImplementation(function (
    this: unknown,
  ) {
    return { send };
  } as never);
  return send;
}

import {
  __resetPsCognitoClientForTests,
  __resetPsSignupCacheForTests,
  getPsCognitoConfig,
  getPsSignupCount,
} from "./ps-cognito";

const ENV = {
  PS_COGNITO_USER_POOL_ID: "us-east-1_abc123",
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
  it("returns the pool ID plus shared region and credentials", () => {
    expect(getPsCognitoConfig()).toEqual({
      userPoolId: "us-east-1_abc123",
      region: "us-east-1",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });
  });

  it("returns null when the pool ID is not configured", () => {
    vi.stubEnv("PS_COGNITO_USER_POOL_ID", "");
    expect(getPsCognitoConfig()).toBeNull();
  });

  it("returns null when credentials are not configured", () => {
    vi.stubEnv("ANALYTICS_AWS_ACCESS_KEY_ID", "");
    expect(getPsCognitoConfig()).toBeNull();
  });
});

describe("getPsSignupCount", () => {
  it("returns null when the pool is not configured", async () => {
    vi.stubEnv("PS_COGNITO_USER_POOL_ID", "");
    expect(await getPsSignupCount()).toBeNull();
  });

  it("counts users across paginated ListUsers responses", async () => {
    const send = mockCognito(async (cmd: unknown) => {
      const token = (cmd as { input: { PaginationToken?: string } }).input
        .PaginationToken;
      if (!token) {
        return {
          Users: [{ Username: "a" }, { Username: "b" }],
          PaginationToken: "next",
        };
      }
      return { Users: [{ Username: "c" }] };
    });

    expect(await getPsSignupCount()).toBe(3);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("returns 0 for an empty pool", async () => {
    mockCognito(async () => ({ Users: [] }));
    expect(await getPsSignupCount()).toBe(0);
  });

  it("treats a missing Users field as zero", async () => {
    mockCognito(async () => ({}));
    expect(await getPsSignupCount()).toBe(0);
  });

  it("shares an in-flight request across concurrent callers", async () => {
    let resolveSend!: (value: unknown) => void;
    const send = mockCognito(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    const p1 = getPsSignupCount();
    const p2 = getPsSignupCount();
    resolveSend({ Users: [{ Username: "a" }] });
    expect(await p1).toBe(1);
    expect(await p2).toBe(1);
    // Only one Cognito request was made for both callers.
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("caches the count for 5 minutes", async () => {
    const send = mockCognito(async () => ({ Users: [{ Username: "a" }] }));
    expect(await getPsSignupCount(1000)).toBe(1);
    expect(await getPsSignupCount(1000 + 4 * 60 * 1000)).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    // After the TTL, it fetches again.
    expect(await getPsSignupCount(1000 + 6 * 60 * 1000)).toBe(1);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
