import { getAnalyticsSummary } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Users, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics — donray.dev",
  description: "Public, privacy-respecting traffic statistics for donray.dev.",
};

function formatDate(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary(30);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16 space-y-8">
      {/* Heading — mirrors the SectionHeader accent bar + title */}
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Public, privacy-respecting traffic stats for donray.dev. No cookies,
          no raw IP addresses stored — ever.
        </p>
      </div>

      {!summary ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Analytics isn&apos;t configured on this build yet. Check back soon.
          </CardContent>
        </Card>
      ) : summary.totalViews === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No page views recorded yet. Stats appear here once people start
            visiting.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Eye className="size-4 text-primary" aria-hidden="true" />
                  Page views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.totalViews.toLocaleString()}
                </div>
                <CardDescription className="mt-1">
                  Real page loads · bots filtered
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  Unique visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.totalUniques.toLocaleString()}
                </div>
                <CardDescription className="mt-1">
                  Last 30 days · estimated
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Pages tracked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.pages.length}</div>
                <CardDescription className="mt-1">
                  Across the whole site
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Daily chart */}
          {summary.dailyTotals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page views per day</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-end gap-1 h-32"
                  role="img"
                  aria-label={`Bar chart of page views per day for the last ${summary.dailyTotals.length} days`}
                >
                  {(() => {
                    const max = Math.max(
                      ...summary.dailyTotals.map((d) => d.views),
                      1,
                    );
                    return summary.dailyTotals.map((d) => (
                      <div
                        key={d.day}
                        className="flex-1 flex flex-col justify-end h-full group relative"
                        title={`${formatDate(d.day)}: ${d.views.toLocaleString()} views`}
                      >
                        <div
                          className="w-full rounded-sm bg-primary/70 group-hover:bg-primary transition-colors"
                          style={{
                            height: `${Math.max(4, (d.views / max) * 100)}%`,
                          }}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{formatDate(summary.dailyTotals[0].day)}</span>
                  <span>
                    {formatDate(
                      summary.dailyTotals[summary.dailyTotals.length - 1].day,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-page table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Views by page</CardTitle>
              <CardDescription>
                All-time totals and estimated unique visitors (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Page
                      </th>
                      <th
                        scope="col"
                        className="py-2 pr-4 font-medium text-right"
                      >
                        Views
                      </th>
                      <th scope="col" className="py-2 font-medium text-right">
                        Unique visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.pages.map((page) => (
                      <tr
                        key={page.path}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-mono">{page.path}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">
                          {page.totalViews.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {page.uniquesLast30d.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Methodology — the honesty section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                How it&apos;s measured
              </CardTitle>
              <CardDescription>
                What these numbers are — and what they aren&apos;t
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  A <strong className="text-foreground">page view</strong> is
                  one real page load in a browser. Images, scripts, and
                  stylesheets don&apos;t count — only the page itself.
                </li>
                <li>
                  Known bots and crawlers are filtered out before counting.
                </li>
                <li>
                  <strong className="text-foreground">Unique visitors</strong>{" "}
                  are estimated: each visit is hashed (IP + browser, salted and
                  non-reversible) and counted once per day. The headline number
                  dedupes across pages — a visitor who reads three pages in one
                  day counts once. Per-page numbers count that visitor once per
                  page. Shared networks can undercount; changing IPs can
                  overcount.
                </li>
                <li>
                  No cookies are set and no raw IP addresses are stored. Daily
                  detail expires automatically after about a year.
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Last updated {formatDateTime(summary.fetchedAt)} · Tracking
                started October 2026
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
