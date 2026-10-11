import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { version } from "../../../../package.json";
import VersionInfo from "@/components/version-info";
import { RELEASES_API, toRelease, type Release } from "@/lib/version";
import { reportError } from "@/lib/report-error";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "version" });
  const alternates = localeAlternates("/version", locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
  };
}

async function getRecentReleases(): Promise<Release[]> {
  try {
    // Cache for five minutes: the GitHub API allows only 60 unauthenticated
    // requests/hour per IP, and shared hosting egress IPs exhaust that fast.
    // An optional GITHUB_TOKEN raises the limit to 5,000/hour.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(RELEASES_API, {
      headers,
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item) =>
      toRelease((item ?? {}) as Parameters<typeof toRelease>[0]),
    );
  } catch (error) {
    reportError(error, { location: "VersionPage.getRecentReleases" });
    return [];
  }
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const initialReleases = await getRecentReleases();

  return (
    <div className="min-h-screen flex items-start justify-center px-4 md:px-16 pt-24 pb-16">
      <VersionInfo currentVersion={version} initialReleases={initialReleases} />
    </div>
  );
}
