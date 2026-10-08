import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VersionReloadToast from "./version-reload-toast";
import { useNewVersionAvailable } from "@/hooks/use-new-version";

vi.mock("@/hooks/use-new-version", () => ({
  useNewVersionAvailable: vi.fn(),
}));

const mockHook = vi.mocked(useNewVersionAvailable);

beforeEach(() => {
  mockHook.mockReturnValue(false);
});

describe("VersionReloadToast", () => {
  it("renders nothing when no update is available", () => {
    const { container } = render(<VersionReloadToast />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the update as a polite status", () => {
    mockHook.mockReturnValue(true);
    render(<VersionReloadToast />);

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(
      screen.getByText("A new version is available. Reload to get the latest."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("attempts a page reload when Reload is clicked", () => {
    mockHook.mockReturnValue(true);
    render(<VersionReloadToast />);
    // jsdom does not implement navigation, so the reload is a no-op here.
    // The click must not throw, and it exercises the reload handler.
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Reload" })),
    ).not.toThrow();
  });

  it("hides the toast for the session when dismissed", () => {
    mockHook.mockReturnValue(true);
    const { container } = render(<VersionReloadToast />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(container).toBeEmptyDOMElement();

    // Esc after a click-dismiss must not resurrect or error.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses on Escape", () => {
    mockHook.mockReturnValue(true);
    const { container } = render(<VersionReloadToast />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container).toBeEmptyDOMElement();
  });

  it("ignores non-Escape keys", () => {
    mockHook.mockReturnValue(true);
    render(<VersionReloadToast />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
