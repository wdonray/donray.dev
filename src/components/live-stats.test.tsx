import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { LiveStats } from "./live-stats";

const STATS = { pageViews: 1234, uniqueVisitors: 56 };

const PROPS = {
  endpoint: "/api/hzc-stats",
  sourceName: "hidezerocards.org's",
  sourceHref: "https://hidezerocards.org/analytics",
};

function mockFetchOnce(
  impl: () => Promise<{ ok: boolean; json: () => Promise<unknown> }>,
) {
  const fetch = vi.fn(impl);
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LiveStats", () => {
  it("renders the stats once loaded", async () => {
    const fetch = mockFetchOnce(async () => ({
      ok: true,
      json: async () => STATS,
    }));
    render(<LiveStats {...PROPS} />);

    expect(fetch).toHaveBeenCalledWith("/api/hzc-stats");
    expect(await screen.findByText("Live stats")).toBeVisible();
    expect(await screen.findByText("1,234")).toBeVisible();
    expect(await screen.findByText("56")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "public analytics" }),
    ).toHaveAttribute("href", "https://hidezerocards.org/analytics");
    expect(
      screen.getByText("All time, from hidezerocards.org's", { exact: false }),
    ).toBeVisible();
  });

  it("uses the given endpoint and source", async () => {
    const fetch = mockFetchOnce(async () => ({
      ok: true,
      json: async () => STATS,
    }));
    render(
      <LiveStats
        endpoint="/api/ps-stats"
        sourceName="patternspell.org's"
        sourceHref="https://patternspell.org/analytics"
      />,
    );

    expect(fetch).toHaveBeenCalledWith("/api/ps-stats");
    expect(await screen.findByText("Live stats")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "public analytics" }),
    ).toHaveAttribute("href", "https://patternspell.org/analytics");
  });

  it("renders nothing when the endpoint is unavailable", async () => {
    mockFetchOnce(async () => ({
      ok: false,
      json: async () => ({ ok: false }),
    }));
    const { container } = render(<LiveStats {...PROPS} />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the payload is malformed", async () => {
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ pageViews: "lots" }),
    }));
    const { container } = render(<LiveStats {...PROPS} />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the request fails", async () => {
    mockFetchOnce(async () => {
      throw new Error("network down");
    });
    const { container } = render(<LiveStats {...PROPS} />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("does not update state after unmount", async () => {
    let resolveFetch!: (value: {
      ok: boolean;
      json: () => Promise<unknown>;
    }) => void;
    mockFetchOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { container, unmount } = render(<LiveStats {...PROPS} />);
    unmount();
    await act(async () => {
      resolveFetch({ ok: true, json: async () => STATS });
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("does not update state after unmount on failure", async () => {
    let rejectFetch!: (reason: unknown) => void;
    mockFetchOnce(
      () =>
        new Promise((_, reject) => {
          rejectFetch = reject;
        }),
    );
    const { container, unmount } = render(<LiveStats {...PROPS} />);
    unmount();
    await act(async () => {
      rejectFetch(new Error("network down"));
    });
    expect(container).toBeEmptyDOMElement();
  });
});
