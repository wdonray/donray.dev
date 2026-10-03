import { getAnalyticsSummary } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Users } from "lucide-react";

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

/**
 * Approximate CDN request counts from AWS CloudWatch (Amplify Hosting,
 * Requests metric), pulled Oct 2, 2026. These count every CDN hit — page
 * loads plus images, scripts, stylesheets, and bots — so they are NOT page
 * views. Shown for rough historical scale only, from before page-view
 * tracking started.
 */
const HISTORICAL_CDN_REQUESTS: {
  month: string;
  requests: number;
  partial?: boolean;
}[] = [
  { month: "Apr 2026", requests: 88000 },
  { month: "May 2026", requests: 55000 },
  { month: "Jun 2026", requests: 75000 },
  { month: "Jul 2026", requests: 95000 },
  { month: "Aug 2026", requests: 128000 },
  { month: "Sep 2026", requests: 118000 },
  { month: "Oct 2026", requests: 15000, partial: true },
];

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
          {/* Real tracking — the database-backed page views */}
          <section aria-labelledby="tracked-heading" className="space-y-6">
            <div className="space-y-1">
              <h2
                id="tracked-heading"
                className="text-xl font-semibold tracking-tight"
              >
                Tracked page views
              </h2>
              <p className="text-sm text-muted-foreground">
                Real page loads, measured from October 2026.
              </p>
            </div>
            {/* Headline stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </section>

          {/* Historical estimates — a different, older measurement */}
          <section aria-labelledby="historical-heading" className="space-y-6">
            <div className="space-y-1">
              <h2
                id="historical-heading"
                className="text-xl font-semibold tracking-tight"
              >
                Before tracking started
              </h2>
              <p className="text-sm text-muted-foreground">
                CDN-request estimates from before page-view tracking existed
                — a different measurement, not page views, and not comparable
                to the tracked numbers above.
              </p>
            </div>

          {/* Historical traffic (estimated) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Historical traffic (estimated)
              </CardTitle>
              <CardDescription>
                CDN requests per month — includes page loads, images, scripts,
                stylesheets, and bots. Not page views; approximate, for rough
                scale only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {(() => {
                  const max = Math.max(
                    ...HISTORICAL_CDN_REQUESTS.map((m) => m.requests),
                  );
                  return HISTORICAL_CDN_REQUESTS.map((m) => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs text-muted-foreground">
                        {m.month}
                        {m.partial ? "*" : ""}
                      </span>
                      <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted">
                        <div
                          className="h-full rounded-sm bg-primary/50"
                          style={{
                            width: `${(m.requests / max) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        ≈{m.requests.toLocaleString()}
                      </span>
                    </div>
                  ));
                })()}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                * Oct 2026 covers Oct 1–2 only. Source: AWS CloudWatch (Amplify
                Hosting requests), pulled Oct 2, 2026. Page-view tracking
                started Oct 2026.
              </p>
            </CardContent>
          </Card>
          </section>

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
                  <strong className="text-foreground">Tracked page views</strong>{" "}
                  are real page loads in a browser, recorded from October 2026.
                  Images, scripts, and stylesheets don&apos;t count — only the
                  page itself. Known bots and crawlers are filtered out before
                  counting.
                </li>
                <li>
                  <strong className="text-foreground">Unique visitors</strong>{" "}
                  are estimated: each visit is hashed (IP + browser, salted and
                  non-reversible) and counted once per day. A visitor who reads
                  several pages in one day counts once. Shared networks can
                  undercount; changing IPs can overcount.
                </li>
                <li>
                  No cookies are set and no raw IP addresses are stored. Daily
                  detail expires automatically after about a year.
                </li>
                <li>
                  <strong className="text-foreground">
                    Historical estimates
                  </strong>{" "}
                  are a separate, older measurement: approximate monthly CDN
                  request counts from AWS CloudWatch, from before page-view
                  tracking existed. They include images, scripts, stylesheets,
                  and bots, so they are not page views and can&apos;t be
                  compared with the tracked numbers.
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
