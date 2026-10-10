"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";
import { reportError } from "@/lib/report-error";

interface LiveStatsData {
  pageViews: number;
  uniqueVisitors: number;
}

type State =
  | { status: "loading" }
  | { status: "ready"; stats: LiveStatsData }
  | { status: "unavailable" };

/**
 * Small live-stats section for project pages: all-time page views and
 * true unique visitors, fetched client-side from a same-origin JSON
 * endpoint (so no CORS or ad-blocker issues, and the page builds without
 * AWS credentials). Renders nothing while loading or when stats are
 * unavailable, so the page never breaks over analytics.
 */
export function LiveStats({
  endpoint,
  sourceName,
  sourceHref,
  external = false,
}: {
  /** Same-origin JSON endpoint returning { pageViews, uniqueVisitors }. */
  endpoint: string;
  /** e.g. "hidezerocards.org's" — possessive name used in the caption. */
  sourceName: string;
  /** Link to the site's public analytics dashboard, when one exists. */
  sourceHref?: string;
  /** Whether the dashboard link points off-site. */
  external?: boolean;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LiveStatsData | null) => {
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
      .catch((error) => {
        reportError(error, { location: "LiveStats", extra: { endpoint } });
        if (!cancelled) setState({ status: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (state.status !== "ready") return null;

  const { pageViews, uniqueVisitors } = state.stats;

  return (
    <section aria-labelledby="live-stats-heading">
      <h2
        id="live-stats-heading"
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
        {sourceHref ? (
          <>
            All time, from {sourceName}{" "}
            <a
              href={sourceHref}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              public analytics
            </a>
            .
          </>
        ) : (
          <>All time, from {sourceName}.</>
        )}
      </p>
    </section>
  );
}
