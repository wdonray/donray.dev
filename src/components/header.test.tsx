import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Header from "./header";

describe("Header", () => {
  it("renders the brand link to the hero", () => {
    render(<Header />);
    const brand = screen.getByRole("link", { name: "Go to homepage" });
    expect(brand).toHaveAttribute("href", "/#hero");
    expect(brand).toHaveTextContent("donray.dev");
  });

  it("renders section navigation links", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: "View skills section" }),
    ).toHaveAttribute("href", "/#skills");
    expect(
      screen.getByRole("link", { name: "View projects section" }),
    ).toHaveAttribute("href", "/#projects");
    expect(
      screen.getByRole("link", { name: "View experience section" }),
    ).toHaveAttribute("href", "/#experience");
  });

  it("renders external contact links", () => {
    render(<Header />);
    const github = screen.getByRole("link", { name: "Visit GitHub profile" });
    expect(github).toHaveAttribute("href", "https://github.com/wdonray");
    expect(github).toHaveAttribute("target", "_blank");

    const linkedin = screen.getByRole("link", {
      name: "Visit LinkedIn profile",
    });
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/donrayxwilliams/",
    );
    expect(linkedin).toHaveAttribute("target", "_blank");

    const email = screen.getByRole("link", { name: "Contact via email" });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
    expect(email).not.toHaveAttribute("target");
  });

  it("renders theme toggles for desktop and mobile", () => {
    render(<Header />);
    expect(
      screen.getAllByRole("button", { name: "Toggle theme" }),
    ).toHaveLength(2);
  });

  it("renders a mobile menu trigger", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });
});

describe("Header scroll behavior", () => {
  it("adds scrolled style after scrolling", async () => {
    const { unmount } = render(<Header />);
    const header = screen.getByRole("banner");

    // Simulate scrolling down.
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    window.dispatchEvent(new Event("scroll"));
    // Second scroll clears the pending timeout (covers clearTimeout branch).
    window.dispatchEvent(new Event("scroll"));

    await new Promise((r) => setTimeout(r, 150));
    expect(header.className).toMatch(/scrolled|shadow|backdrop/i);

    // Scroll back to top.
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => setTimeout(r, 150));

    unmount(); // covers cleanup with pending timeout
  });
});

describe("Header hide-on-scroll (mobile)", () => {
  const realMatchMedia = window.matchMedia;
  const realScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");

  function mockMobile(isMobile: boolean) {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: isMobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
  }

  function setScrollY(y: number) {
    Object.defineProperty(window, "scrollY", { value: y, writable: true });
    window.dispatchEvent(new Event("scroll"));
  }

  afterEach(() => {
    window.matchMedia = realMatchMedia;
    if (realScrollY) Object.defineProperty(window, "scrollY", realScrollY);
  });

  it("hides on scroll down and reveals on scroll up (mobile)", async () => {
    mockMobile(true);
    const { unmount } = render(<Header />);
    const header = screen.getByRole("banner");

    setScrollY(200);
    await waitFor(() => expect(header.style.transform).toContain("-100%"));

    setScrollY(100);
    await waitFor(() => expect(header.style.transform).not.toContain("-100%"));

    unmount();
  });

  it("stays visible near the top (mobile)", async () => {
    mockMobile(true);
    const { unmount } = render(<Header />);
    const header = screen.getByRole("banner");

    setScrollY(100);
    // Give framer-motion a frame; near-top must not hide.
    await new Promise((r) => setTimeout(r, 50));
    expect(header.style.transform).not.toContain("-100%");

    unmount();
  });

  it("never hides on desktop", async () => {
    mockMobile(false);
    const { unmount } = render(<Header />);
    const header = screen.getByRole("banner");

    setScrollY(500);
    await new Promise((r) => setTimeout(r, 50));
    expect(header.style.transform).not.toContain("-100%");

    unmount();
  });

  it("stays visible while the mobile menu is open", async () => {
    mockMobile(true);
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<Header />);
    const header = screen.getByRole("banner");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await screen.findByRole("dialog");

    setScrollY(500);
    await waitFor(() => expect(header.style.transform).not.toContain("-100%"));
  });
});

describe("Header mobile sheet", () => {
  it("opens the sheet with navigation links", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    // Sheet content renders with the nav links.
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.querySelector('a[href="/#skills"]')).not.toBeNull();

    // Close via the close button.
    const close = dialog.querySelector('button[aria-label="Close"]');
    if (close) await user.click(close as HTMLElement);
  });
});
