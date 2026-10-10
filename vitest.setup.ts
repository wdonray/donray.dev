import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";
import { createTranslator } from "next-intl";
import enMessages from "./messages/en.json";

// Unit tests run outside NextIntlClientProvider, so hook the translation
// hooks up to the real English catalog. This also guards the catalog:
// a missing/renamed key fails the test that uses it.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useTranslations: (namespace?: string) =>
      actual.createTranslator({
        locale: "en",
        messages: enMessages,
        // The mock accepts any namespace; real catalog keys are
        // type-checked in source via next-intl's inferred message types.
        namespace: namespace as never,
      }),
    useLocale: () => "en",
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: (arg?: string | { locale: string; namespace?: string }) => {
    const namespace = typeof arg === "string" ? arg : arg?.namespace;
    return Promise.resolve(
      createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: namespace as never,
      }),
    );
  },
  getLocale: () => Promise.resolve("en"),
  setRequestLocale: () => undefined,
  getMessages: () => Promise.resolve(enMessages),
}));

// Locale-aware navigation needs router context; tests assert on plain
// anchors instead.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) =>
    React.createElement(
      "a",
      { href: typeof href === "string" ? href : "/", ...rest },
      children,
    ),
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  redirect: vi.fn(),
  getPathname: () => "/",
}));

// Testing Library doesn't auto-clean the DOM without vitest globals.
afterEach(() => {
  cleanup();
});

// framer-motion's useInView relies on IntersectionObserver, which jsdom lacks.
// Fire immediately as intersecting so components render their "in view" state,
// matching what a user sees after scrolling to a section.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private callback: IntersectionObserverCallback) {}

  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this,
    );
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// next-themes reads window.matchMedia to resolve the system theme.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// The experience section scrolls newly revealed content into view.
window.HTMLElement.prototype.scrollIntoView = () => {};
