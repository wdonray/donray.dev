import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VersionInfo, {
  compareVersions,
  formatDate,
  parseVersion,
  statusFor,
  type LatestRelease,
} from "./version-info";

const release = (version: string): LatestRelease => ({
  version,
  url: "https://github.com/wdonray/donray.dev/releases",
  publishedAt: "2026-10-01T12:00:00Z",
});

afterEach(() => {
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

describe("statusFor", () => {
  it("is up-to-date when versions match", () => {
    expect(statusFor("0.5.0", release("0.5.0"))).toBe("up-to-date");
  });

  it("is behind when the release is newer", () => {
    expect(statusFor("0.5.0", release("0.6.0"))).toBe("behind");
  });

  it("is ahead when the build is newer than the release", () => {
    expect(statusFor("0.6.0", release("0.5.0"))).toBe("ahead");
  });

  it("is an error when the release is unknown", () => {
    expect(statusFor("0.5.0", null)).toBe("error");
  });
});

describe("formatDate", () => {
  it("formats an ISO date for display", () => {
    expect(formatDate("2026-10-01T12:00:00Z")).toBe("Oct 1, 2026");
  });

  it("returns null for null input", () => {
    expect(formatDate(null)).toBeNull();
  });
});

describe("VersionInfo", () => {
  it("renders the current build version", () => {
    render(<VersionInfo currentVersion="0.5.0" initialLatest={null} />);
    expect(screen.getByText("This build")).toBeInTheDocument();
    expect(screen.getByText("v0.5.0")).toBeInTheDocument();
  });

  it("retries the lookup from the browser on mount when the server lookup failed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            tag_name: "v0.5.0",
            html_url: "https://github.com/wdonray/donray.dev/releases",
            published_at: "2026-10-01T12:00:00Z",
          }),
      }),
    );
    render(<VersionInfo currentVersion="0.5.0" initialLatest={null} />);
    expect(
      await screen.findByText("You're on the latest release."),
    ).toBeInTheDocument();
  });

  it("shows an error banner when the release is unknown", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<VersionInfo currentVersion="0.5.0" initialLatest={null} />);
    expect(
      await screen.findByText("Couldn't reach GitHub to compare versions."),
    ).toBeInTheDocument();
  });

  it("shows up-to-date when versions match", () => {
    render(
      <VersionInfo currentVersion="0.5.0" initialLatest={release("0.5.0")} />,
    );
    expect(
      screen.getByText("You're on the latest release."),
    ).toBeInTheDocument();
    expect(screen.getByText("Oct 1, 2026")).toBeInTheDocument();
  });

  it("shows behind when a newer release exists", () => {
    render(
      <VersionInfo currentVersion="0.5.0" initialLatest={release("0.6.0")} />,
    );
    expect(
      screen.getByText("A newer release is available."),
    ).toBeInTheDocument();
  });

  it("shows ahead when the build is newer than the release", () => {
    render(
      <VersionInfo currentVersion="0.6.0" initialLatest={release("0.5.0")} />,
    );
    expect(screen.getByText(/ahead of the latest release/)).toBeInTheDocument();
  });

  it("check again updates the status from the GitHub API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: "v0.6.0",
          html_url: "https://github.com/wdonray/donray.dev/releases",
          published_at: "2026-10-02T12:00:00Z",
        }),
      }),
    );

    render(
      <VersionInfo currentVersion="0.5.0" initialLatest={release("0.5.0")} />,
    );
    expect(
      screen.getByText("You're on the latest release."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /check again/i }));

    await waitFor(() => {
      expect(
        screen.getByText("A newer release is available."),
      ).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/wdonray/donray.dev/releases/latest",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("check again shows an error when GitHub is unreachable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(
      <VersionInfo currentVersion="0.5.0" initialLatest={release("0.5.0")} />,
    );
    await user.click(screen.getByRole("button", { name: /check again/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Couldn't reach GitHub to compare versions."),
      ).toBeInTheDocument();
    });
  });

  it("disables check again while loading", async () => {
    const user = userEvent.setup();
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

    render(
      <VersionInfo currentVersion="0.5.0" initialLatest={release("0.5.0")} />,
    );
    const button = screen.getByRole("button", { name: /check again/i });
    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());

    resolveFetch({
      ok: true,
      json: async () => ({
        tag_name: "v0.5.0",
        html_url: "https://github.com/wdonray/donray.dev/releases",
        published_at: "2026-10-01T12:00:00Z",
      }),
    });

    await waitFor(() => expect(button).toBeEnabled());
  });
});
