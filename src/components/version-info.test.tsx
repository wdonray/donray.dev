import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { toastError } from "@/lib/error-toast";
import VersionInfo, {
  POLL_INTERVAL_MS,
  compareVersions,
  fetchReleases,
  formatCheckedAgo,
  formatDate,
  parseVersion,
  summarizeRelease,
  timeAgo,
  toRelease,
  type Release,
} from "./version-info";

vi.mock("@/lib/error-toast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/error-toast")>();
  return { ...actual, toastError: vi.fn() };
});

const toastErrorMock = vi.mocked(toastError);

const NOW = Date.parse("2026-10-03T12:00:00Z");

const releasePayload = (
  tag: string,
  overrides: Record<string, unknown> = {},
) => ({
  tag_name: tag,
  html_url: `https://github.com/wdonray/donray.dev/releases/tag/${tag}`,
  published_at: "2026-10-03T11:00:00Z",
  body: "### \u2705 Tests\n\n  - Some change (abc1234)\n",
  ...overrides,
});

const release = (
  version: string,
  overrides: Partial<Release> = {},
): Release => ({
  version,
  url: "https://github.com/wdonray/donray.dev/releases",
  publishedAt: "2026-10-03T11:00:00Z",
  summary: "Some change",
  ...overrides,
});

function mockFetchResponse(payload: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 403,
    json: async () => payload,
  });
}

function useFakeTimers() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("parseVersion", () => {
  it("parses semver parts", () => {
    expect(parseVersion("0.5.0")).toEqual([0, 5, 0]);
  });

  it("strips a leading v", () => {
    expect(parseVersion("v0.4.19")).toEqual([0, 4, 19]);
  });

  it("treats non-numeric parts as 0", () => {
    expect(parseVersion("1.2.x")).toEqual([1, 2, 0]);
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("0.5.0", "0.5.0")).toBe(0);
    expect(compareVersions("v0.5.0", "0.5.0")).toBe(0);
  });

  it("returns 1 when a is newer", () => {
    expect(compareVersions("0.6.0", "0.5.0")).toBe(1);
    expect(compareVersions("0.5.1", "0.5.0")).toBe(1);
    expect(compareVersions("1.0.0", "0.99.99")).toBe(1);
  });

  it("returns -1 when a is older", () => {
    expect(compareVersions("0.4.20", "0.5.0")).toBe(-1);
  });

  it("compares versions of different lengths", () => {
    expect(compareVersions("1.2", "1.2.0")).toBe(0);
    expect(compareVersions("1.2.1", "1.2")).toBe(1);
  });
});

describe("summarizeRelease", () => {
  it("returns null for null input", () => {
    expect(summarizeRelease(null)).toBeNull();
  });

  it("extracts the first PR title", () => {
    expect(
      summarizeRelease(
        "### \u2705 Tests\n\n  - Fix project card locators (80946f4)\n  - Simplify assertions (2816486)\n",
      ),
    ).toBe("Fix project card locators");
  });

  it("returns null when no PR line is present", () => {
    expect(
      summarizeRelease("### \u2764\ufe0f Contributors\n\n- Wdonray"),
    ).toBeNull();
  });

  it("ignores contributor lines without a sha", () => {
    expect(summarizeRelease("- Just a line\n- Another (nothex!)")).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats an ISO date for display", () => {
    expect(formatDate("2026-10-01T12:00:00Z", "en")).toBe("Oct 1, 2026");
  });

  it("returns null for null input", () => {
    expect(formatDate(null, "en")).toBeNull();
  });
});

describe("timeAgo", () => {
  it("returns null for null input", () => {
    expect(timeAgo(null, NOW, "en")).toBeNull();
  });

  it("says now for under a minute", () => {
    expect(timeAgo(new Date(NOW - 30_000).toISOString(), NOW, "en")).toBe(
      "now",
    );
  });

  it("clamps future dates to now", () => {
    expect(timeAgo(new Date(NOW + 60_000).toISOString(), NOW, "en")).toBe(
      "now",
    );
  });

  it("shows minutes", () => {
    expect(timeAgo(new Date(NOW - 5 * 60_000).toISOString(), NOW, "en")).toBe(
      "5 minutes ago",
    );
  });

  it("shows hours", () => {
    expect(
      timeAgo(new Date(NOW - 3 * 3_600_000).toISOString(), NOW, "en"),
    ).toBe("3 hours ago");
  });

  it("shows days", () => {
    expect(
      timeAgo(new Date(NOW - 2 * 86_400_000).toISOString(), NOW, "en"),
    ).toBe("2 days ago");
  });

  it("returns null past a week", () => {
    expect(
      timeAgo(new Date(NOW - 10 * 86_400_000).toISOString(), NOW, "en"),
    ).toBeNull();
  });
});

describe("formatCheckedAgo", () => {
  it("shows a relative age", () => {
    expect(formatCheckedAgo(NOW - 2 * 60_000, NOW, "en")).toBe("2 minutes ago");
  });

  it("falls back to now for stale timestamps", () => {
    expect(formatCheckedAgo(NOW - 10 * 86_400_000, NOW, "en")).toBe("now");
  });
});

describe("toRelease", () => {
  it("normalizes a full payload", () => {
    expect(toRelease(releasePayload("v0.6.0"))).toEqual({
      version: "0.6.0",
      url: "https://github.com/wdonray/donray.dev/releases/tag/v0.6.0",
      publishedAt: "2026-10-03T11:00:00Z",
      summary: "Some change",
    });
  });

  it("handles missing fields", () => {
    expect(toRelease({})).toEqual({
      version: "",
      url: "https://github.com/wdonray/donray.dev/releases",
      publishedAt: null,
      summary: null,
    });
  });

  it("handles wrongly typed fields", () => {
    expect(
      toRelease({
        tag_name: "v1.0.0",
        html_url: "",
        published_at: 123,
        body: 456,
      }),
    ).toEqual({
      version: "1.0.0",
      url: "https://github.com/wdonray/donray.dev/releases",
      publishedAt: null,
      summary: null,
    });
  });
});

describe("fetchReleases", () => {
  it("fetches and normalizes releases", async () => {
    vi.stubGlobal("fetch", mockFetchResponse([releasePayload("v0.6.0")]));
    const releases = await fetchReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0]?.version).toBe("0.6.0");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/wdonray/donray.dev/releases?per_page=5",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("throws when GitHub responds non-OK", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(null, false));
    await expect(fetchReleases()).rejects.toThrow("GitHub responded 403");
  });

  it("throws when the response is not a list", async () => {
    vi.stubGlobal("fetch", mockFetchResponse({ tag_name: "v1.0.0" }));
    await expect(fetchReleases()).rejects.toThrow("Unexpected GitHub response");
  });

  it("tolerates null items in the list", async () => {
    vi.stubGlobal("fetch", mockFetchResponse([null]));
    const releases = await fetchReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0]?.version).toBe("");
  });
});

describe("VersionInfo", () => {
  it("renders the heading, live indicator, and current build", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", mockFetchResponse([releasePayload("v0.5.0")]));
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(
      screen.getByRole("heading", { name: "Version" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("This build")).toHaveLength(2);
    expect(screen.getAllByText("v0.5.0")).toHaveLength(2);
    expect(screen.getByText(/Live/)).toBeInTheDocument();
    expect(screen.getByText(/updated now/)).toBeInTheDocument();
  });

  it("marks the newest release with Latest and the running build", async () => {
    useFakeTimers();
    vi.stubGlobal(
      "fetch",
      mockFetchResponse([
        releasePayload("v0.6.0"),
        releasePayload("v0.5.0", { published_at: "2026-10-02T12:00:00Z" }),
      ]),
    );
    render(
      <VersionInfo
        currentVersion="0.5.0"
        initialReleases={[
          release("0.6.0"),
          release("0.5.0", { publishedAt: "2026-10-02T12:00:00Z" }),
        ]}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getAllByText("This build")).toHaveLength(2);
    expect(screen.getAllByText("v0.5.0")).toHaveLength(2);
    expect(screen.getAllByText("Some change")).toHaveLength(2);
    expect(screen.getByText("Oct 3, 2026 · 1 hour ago")).toBeInTheDocument();
    expect(screen.getByText("Oct 2, 2026 · yesterday")).toBeInTheDocument();
  });

  it("omits the summary and date when a release lacks them", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", mockFetchResponse([]));
    render(
      <VersionInfo
        currentVersion="0.5.0"
        initialReleases={[
          release("0.5.0", { summary: null, publishedAt: null }),
        ]}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByText("Some change")).not.toBeInTheDocument();
    expect(screen.queryByText(/Oct 3, 2026/)).not.toBeInTheDocument();
  });

  it("shows only the absolute date for releases older than a week", async () => {
    useFakeTimers();
    vi.stubGlobal(
      "fetch",
      mockFetchResponse([
        releasePayload("v0.5.0", { published_at: "2026-09-20T12:00:00Z" }),
      ]),
    );
    render(
      <VersionInfo
        currentVersion="0.5.0"
        initialReleases={[
          release("0.5.0", { publishedAt: "2026-09-20T12:00:00Z" }),
        ]}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Sep 20, 2026")).toBeInTheDocument();
  });

  it("shows a quiet empty state when no releases exist", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", mockFetchResponse([]));
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("No releases found.")).toBeInTheDocument();
  });

  it("fetches fresh releases on mount", async () => {
    useFakeTimers();
    const fetchMock = mockFetchResponse([releasePayload("v0.6.0")]);
    vi.stubGlobal("fetch", fetchMock);
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/wdonray/donray.dev/releases?per_page=5",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(screen.getByText("v0.6.0")).toBeInTheDocument();
    expect(screen.queryByText("Couldn't reach GitHub")).not.toBeInTheDocument();
  });

  it("polls for new releases on the interval and updates the list", async () => {
    useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [releasePayload("v0.6.0")],
      })
      .mockResolvedValue({
        ok: true,
        json: async () => [releasePayload("v0.7.0"), releasePayload("v0.6.0")],
      });
    vi.stubGlobal("fetch", fetchMock);
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("v0.6.0")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(90_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Live · updated 1 minute ago")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("v0.7.0")).toBeInTheDocument();
    expect(screen.getByText("Live · updated now")).toBeInTheDocument();
  });

  it("shows offline in the live indicator but keeps last-known releases when polling fails", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(
      <VersionInfo
        currentVersion="0.5.0"
        initialReleases={[release("0.5.0")]}
      />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(
      screen.getByText("Offline · showing last known releases"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("v0.5.0")).toHaveLength(2);
  });

  it("fires an error toast (and no inline notice) when GitHub is unreachable", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // The error surfaces as a toast, not inline red text.
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );
    expect(
      screen.queryByText("Couldn't reach GitHub to load releases."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Offline · showing last known releases"),
    ).toBeInTheDocument();
  });

  it("toasts only once while polling keeps failing", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(toastErrorMock).toHaveBeenCalledTimes(1);

    // Two more failed poll cycles: no additional toasts.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    });
    expect(toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it("renders releases without a version tag", async () => {
    useFakeTimers();
    vi.stubGlobal("fetch", mockFetchResponse([{}]));
    render(<VersionInfo currentVersion="0.5.0" initialReleases={[]} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("v", { exact: true })).toBeInTheDocument();
  });

  it("stops polling on unmount", async () => {
    useFakeTimers();
    const fetchMock = mockFetchResponse([releasePayload("v0.6.0")]);
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(
      <VersionInfo currentVersion="0.5.0" initialReleases={[]} />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores a late poll success after unmount", async () => {
    useFakeTimers();
    let resolveFetch: (value: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );
    const { unmount } = render(
      <VersionInfo currentVersion="0.5.0" initialReleases={[]} />,
    );
    unmount();
    await act(async () => {
      resolveFetch({ ok: true, json: async () => [releasePayload("v0.6.0")] });
      await vi.advanceTimersByTimeAsync(0);
    });
  });

  it("ignores a late poll failure after unmount", async () => {
    useFakeTimers();
    let rejectFetch: (reason: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            rejectFetch = reject;
          }),
      ),
    );
    const { unmount } = render(
      <VersionInfo currentVersion="0.5.0" initialReleases={[]} />,
    );
    unmount();
    await act(async () => {
      rejectFetch(new Error("too late"));
      await vi.advanceTimersByTimeAsync(0);
    });
  });
});
