import { hasLocale } from "next-intl";
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnalyticsSummary } from "@/lib/analytics";
import { PageViewsByPage } from "@/components/page-views-by-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Users } from "lucide-react";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "analytics" });
  const alternates = localeAlternates("/analytics", locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
    },
  };
}

function formatDate(isoDay: string, locale: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Approximate CDN request counts from AWS CloudWatch (Amplify Hosting,
 * Requests metric), pulled Oct 2, 2026. These count every CDN hit:
 * page loads plus images, scripts, stylesheets, and bots. So they are
 * NOT page views. Shown for rough historical scale only, from before
 * page-view tracking started.
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

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("analytics");
  const activeLocale = await getLocale();
  const summary = await getAnalyticsSummary(30);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-8">
      {/* Heading: mirrors the SectionHeader accent bar + title */}
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>

      {!summary ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("notConfigured")}
          </CardContent>
        </Card>
      ) : summary.totalViews === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("noViews")}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Real tracking: the database-backed page views */}
          <section aria-labelledby="tracked-heading" className="space-y-6">
            <div className="space-y-1">
              <h2
                id="tracked-heading"
                className="text-xl font-semibold tracking-tight"
              >
                {t("tracked")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("trackedDescription")}
              </p>
            </div>
            {/* Headline stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Eye className="size-4 text-primary" aria-hidden="true" />
                    {t("pageViews")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {summary.totalViews.toLocaleString(activeLocale)}
                  </div>
                  <CardDescription className="mt-1">
                    {t("allTimeBotsFiltered")}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="size-4 text-primary" aria-hidden="true" />
                    {t("uniqueVisitors")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {summary.totalUniques.toLocaleString(activeLocale)}
                  </div>
                  <CardDescription className="mt-1">
                    {t("allTimeBotsFiltered")}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Daily chart */}
            {summary.dailyTotals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("perDay")}</CardTitle>
                  <CardDescription>{t("last30Days")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="flex items-end gap-1 h-32"
                    role="img"
                    aria-label={t("chartLabel", {
                      days: summary.dailyTotals.length,
                    })}
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
                          title={t("chartPoint", {
                            date: formatDate(d.day, activeLocale),
                            views: d.views.toLocaleString(activeLocale),
                          })}
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
                    <span>
                      {formatDate(summary.dailyTotals[0].day, activeLocale)}
                    </span>
                    <span>
                      {formatDate(
                        summary.dailyTotals[summary.dailyTotals.length - 1].day,
                        activeLocale,
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Per-page breakdown: all-time views and uniques per path */}
            <PageViewsByPage pages={summary.pages} />
          </section>

          {/* Historical estimates: a different, older measurement */}
          <section aria-labelledby="historical-heading" className="space-y-6">
            <div className="space-y-1">
              <h2
                id="historical-heading"
                className="text-xl font-semibold tracking-tight"
              >
                {t("historical")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("historicalDescription")}
              </p>
            </div>

            {/* Historical traffic (estimated) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("historicalTraffic")}
                </CardTitle>
                <CardDescription>
                  {t("historicalTrafficDescription")}
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
                          ≈{m.requests.toLocaleString(activeLocale)}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {t("historicalFootnote")}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Methodology: the honesty section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("methodology")}</CardTitle>
              <CardDescription>{t("methodologyDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">
                    {t("methodologyTracked")}
                  </strong>{" "}
                  {t("methodologyTrackedBody")}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t("methodologyUniques")}
                  </strong>{" "}
                  {t("methodologyUniquesBody")}
                </li>
                <li>{t("methodologyNoCookies")}</li>
                <li>
                  <strong className="text-foreground">
                    {t("methodologyHistorical")}
                  </strong>{" "}
                  {t("methodologyHistoricalBody")}
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("lastUpdated", {
                  datetime: formatDateTime(summary.fetchedAt, activeLocale),
                })}
              </p>
            </CardContent>
          </Card>

          {/* What the numbers taught me */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("learned")}</CardTitle>
              <CardDescription>{t("learnedDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">{t("learnedCdn")}</strong>{" "}
                  {t("learnedCdnBody")}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t("learnedHomepage")}
                  </strong>{" "}
                  {t("learnedHomepageBody")}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t("learnedPrivacy")}
                  </strong>{" "}
                  {t("learnedPrivacyBody")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
