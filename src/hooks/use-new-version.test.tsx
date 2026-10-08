import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VERSION_POLL_INTERVAL_MS,
  VISIBILITY_POLL_MIN_MS,
  fetchDeployedVersion,
  useNewVersionAvailable,
} from "./use-new-version";

function TestHarness() {
  const available = useNewVersionAvailable();
  return <div data-testid="state">{available ? "yes" : "no"}</div>;
}

type VersionAnswer = string | null | Error;

/**
 * Stub global fetch so each call answers with the next value.
 * A string answers { version }; null answers a failed request;
 * an Error makes the request itself fail.
 */
function mockFetchVersions(answers: VersionAnswer[]) {
  let index = 0;
  const fetchMock = vi.fn(async () => {
    const answer = answers[Math.min(index, answers.length - 1)];
    index += 1;
    if (answer instanceof Error) throw answer;
    if (answer === null) return { ok: false };
    return { ok: true, json: async () => ({ version: answer }) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchDeployedVersion", () => {
  it("returns the version from /api/version", async () => {
    mockFetchVersions(["0.15.17"]);
    await expect(fetchDeployedVersion()).resolves.toBe("0.15.17");
  });

  it("returns null when the response is not ok", async () => {
    mockFetchVersions([null]);
    await expect(fetchDeployedVersion()).resolves.toBeNull();
  });

  it("returns null when the payload is not an object", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => "nope" })),
    );
    await expect(fetchDeployedVersion()).resolves.toBeNull();
  });

  it("returns null when the payload is null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => null })),
    );
    await expect(fetchDeployedVersion()).resolves.toBeNull();
  });

  it("returns null when the version is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ version: 42 }) })),
    );
    await expect(fetchDeployedVersion()).resolves.toBeNull();
  });

  it("returns null when the request fails", async () => {
    mockFetchVersions([new Error("offline")]);
    await expect(fetchDeployedVersion()).resolves.toBeNull();
  });

  it("aborts a hung request and returns null", async () => {
    vi.useFakeTimers();
    // A fetch that only settles when its signal aborts, like a real one.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, options?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            options?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          }),
      ),
    );
    const promise = fetchDeployedVersion();
    await vi.advanceTimersByTimeAsync(6000);
    await expect(promise).resolves.toBeNull();
  });
});

describe("useNewVersionAvailable", () => {
  it("stays false when the deployed version matches the loaded one", async () => {
    vi.useFakeTimers();
    mockFetchVersions(["0.15.17"]);
    const { getByTestId } = render(<TestHarness />);
    await act(async () => {});
    expect(getByTestId("state").textContent).toBe("no");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VERSION_POLL_INTERVAL_MS);
    });
    await act(async () => {});
    expect(getByTestId("state").textContent).toBe("no");
  });

  it("becomes true when the interval poll sees a different version", async () => {
    vi.useFakeTimers();
    mockFetchVersions(["0.15.17", "0.15.18"]);
    const { getByTestId } = render(<TestHarness />);
    await act(async () => {});
    expect(getByTestId("state").textContent).toBe("no");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VERSION_POLL_INTERVAL_MS);
    });
    await act(async () => {});
    expect(getByTestId("state").textContent).toBe("yes");
  });

  it("polls on visibilitychange to visible after 60 seconds", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchVersions(["0.15.17", "0.15.18"]);
    render(<TestHarness />);
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setVisibility("visible");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VISIBILITY_POLL_MIN_MS + 1000);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips visibility polls within 60 seconds of the last poll", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchVersions(["0.15.17"]);
    render(<TestHarness />);
    await act(async () => {});

    setVisibility("visible");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores visibilitychange when the tab is not visible", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchVersions(["0.15.17"]);
    render(<TestHarness />);
    await act(async () => {});

    setVisibility("hidden");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VISIBILITY_POLL_MIN_MS + 1000);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("polls on window focus after 60 seconds", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchVersions(["0.15.17"]);
    render(<TestHarness />);
    await act(async () => {});

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VISIBILITY_POLL_MIN_MS + 1000);
      window.dispatchEvent(new Event("focus"));
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stays silent on network failure and retries on the next poll", async () => {
    vi.useFakeTimers();
    mockFetchVersions([new Error("offline"), "0.15.17"]);
    const { getByTestId } = render(<TestHarness />);
    await act(async () => {});
    expect(getByTestId("state").textContent).toBe("no");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VERSION_POLL_INTERVAL_MS);
    });
    await act(async () => {});
    // The retry captured the loaded version, so no update is flagged.
    expect(getByTestId("state").textContent).toBe("no");
  });

  it("ignores poll responses that resolve after unmount", async () => {
    vi.useFakeTimers();
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn(
      () => new Promise((resolve) => (resolveFetch = resolve)),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { queryByTestId, unmount } = render(<TestHarness />);
    unmount();
    resolveFetch({ ok: true, json: async () => ({ version: "9.9.9" }) });
    await act(async () => {});
    // The late response is discarded; the tree stays unmounted.
    expect(queryByTestId("state")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stops polling and listening after unmount", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchVersions(["0.15.17"]);
    const { unmount } = render(<TestHarness />);
    await act(async () => {});
    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VERSION_POLL_INTERVAL_MS);
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
