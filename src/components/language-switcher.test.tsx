import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSwitcher from "./language-switcher";

const replaceMock = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...rest }, children),
  usePathname: () => "/projects",
  useRouter: () => ({
    replace: replaceMock,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
  getPathname: () => "/",
}));

beforeEach(() => {
  replaceMock.mockClear();
});

async function openMenu() {
  const user = userEvent.setup();
  render(<LanguageSwitcher />);
  await user.click(screen.getByRole("button", { name: "Choose a language" }));
  return user;
}

describe("LanguageSwitcher", () => {
  it("renders a language button", () => {
    render(<LanguageSwitcher />);
    expect(
      screen.getByRole("button", { name: "Choose a language" }),
    ).toBeInTheDocument();
  });

  it("lists all four languages with the current one marked", async () => {
    await openMenu();
    for (const name of ["English", "Español", "中文", "Tagalog"]) {
      expect(
        screen.getByRole("menuitem", { name: new RegExp(name) }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("menuitem", { name: /English/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("switches to the selected locale keeping the current path", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: /Español/ }));
    expect(replaceMock).toHaveBeenCalledWith("/projects", { locale: "es" });
  });

  it("does nothing when the current locale is selected", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: /English/ }));
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
