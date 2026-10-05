import React from "react";

/**
 * Test stub for `next-view-transitions`.
 *
 * jsdom has no View Transitions API, and the real module's internal
 * `next/link` import breaks vitest's module resolver. These thin
 * passthroughs let component tests keep asserting on rendered anchors
 * and children without the browser API.
 */

type Href = string | { pathname?: string };

function hrefToString(href: Href): string {
  return typeof href === "string" ? href : (href.pathname ?? "");
}

export function Link({
  href,
  children,
  ...props
}: {
  href: Href;
  children: React.ReactNode;
} & Record<string, unknown>) {
  return (
    <a href={hrefToString(href)} {...props}>
      {children}
    </a>
  );
}

export function ViewTransitions({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTransitionRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };
}
