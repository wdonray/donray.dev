import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { ModeToggle } from "./mode-toggle";

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ModeToggle />
    </ThemeProvider>,
  );
}

describe("ModeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("switches to dark on the first click from the system theme", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("switches back to light on the second click", async () => {
    const user = userEvent.setup();
    renderToggle();

    const toggle = screen.getByRole("button", { name: "Toggle theme" });
    await user.click(toggle);
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );

    await user.click(toggle);
    await waitFor(() =>
      expect(document.documentElement.classList.contains("light")).toBe(true),
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
