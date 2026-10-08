"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";

interface HzcStats {
  pageViews: number;
  uniqueVisitors: number;
}

type State =
  | { status: "loading" }
  | { status: "ready"; stats: HzcStats }
  | { status: "unavailable" };

/**
 * Small live-stats section for the Hide Zero Cards project page.
 * Fetches from /api/hzc-stats (same origin, so no CORS or ad-blocker
 * issues); the numbers are already public on hidezerocards.org/analytics.
 * Renders nothing while loading or when stats are unavailable, so the
 * page never breaks over analytics.
 */
export function HzcStats() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hzc-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HzcStats | null) => {
        if (cancelled) return;
        if (
          data &&
          typeof data.pageViews === "number" &&
          typeof data.uniqueVisitors === "number"
        ) {
          setState({ status: "ready", stats: data });
        } else {
          setState({ status: "unavailable" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status !== "ready") return null;

  const { pageViews, uniqueVisitors } = state.stats;

  return (
    <section aria-labelledby="hzc-stats-heading">
      <h2
        id="hzc-stats-heading"
        className="text-2xl font-bold tracking-tight mb-4"
      >
        Live stats
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Eye className="size-4 text-primary" aria-hidden="true" />
            Page views
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {pageViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="size-4 text-primary" aria-hidden="true" />
            Unique visitors
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {uniqueVisitors.toLocaleString()}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        All time, from hidezerocards.org&apos;s{" "}
        <a
          href="https://hidezerocards.org/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:opacity-80"
        >
          public analytics
        </a>
        .
      </p>
    </section>
  );
}
