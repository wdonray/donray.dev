"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, fadeInUpWithDelay } from "@/lib/animations";
import { reportError } from "@/lib/report-error";
import { getErrorMessageKey, toastError } from "@/lib/error-toast";
import {
  POLL_INTERVAL_MS,
  compareVersions,
  fetchReleases,
  formatCheckedAgo,
  formatDate,
  timeAgo,
  type Release,
} from "@/lib/version";

/** How often the relative timestamps ("3h ago") re-render. */
const TICK_INTERVAL_MS = 15_000;

export default function VersionInfo({
  currentVersion,
  initialReleases,
}: {
  currentVersion: string;
  initialReleases: Release[];
}) {
  const t = useTranslations("version");
  const te = useTranslations("errorToast");
  const locale = useLocale();
  const [releases, setReleases] = useState<Release[]>(initialReleases);
  const [lastChecked, setLastChecked] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [unreachable, setUnreachable] = useState(initialReleases.length === 0);
  // Toast once per outage: the poll retries every 2 minutes, so only the
  // first failure surfaces a toast. Reset on success for the next outage.
  const toastedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await fetchReleases();
        if (cancelled) return;
        setReleases(next);
        setLastChecked(Date.now());
        setUnreachable(false);
        toastedRef.current = false;
      } catch (error) {
        reportError(error, { location: "VersionInfo.poll" });
        if (!cancelled) {
          setUnreachable(true);
          if (!toastedRef.current) {
            toastedRef.current = true;
            toastError(te(getErrorMessageKey(error)));
          }
        }
      }
    };
    // Always re-check from the browser on mount: an independent network with
    // its own rate-limit quota, and fresher than the server cache.
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [te]);

  useEffect(() => {
    /* v8 ignore next 2: trivial timing-dependent tick callback */
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const checkedAgo = formatCheckedAgo(lastChecked, now, locale);

  return (
    <div className="w-full max-w-xl space-y-8">
      {/* Heading: mirrors the SectionHeader accent bar + title */}
      <motion.div className="space-y-2" {...fadeInUp}>
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex size-2" aria-hidden="true">
            {unreachable ? (
              <span className="relative inline-flex size-2 rounded-full bg-muted-foreground" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </>
            )}
          </span>
          <span>
            {unreachable
              ? t("offline")
              : `${t("live")} · ${t("updated", { ago: checkedAgo })}`}
          </span>
        </p>
      </motion.div>

      <motion.div className="space-y-3" {...fadeInUpWithDelay(0.1)}>
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t("thisBuild")}
          </span>
          <span className="font-mono text-lg font-semibold">
            v{currentVersion}
          </span>
        </div>
      </motion.div>

      <motion.div {...fadeInUpWithDelay(0.15)}>
        {releases.length > 0 ? (
          <ol className="space-y-3">
            {releases.map((release, index) => {
              const relative = timeAgo(release.publishedAt, now, locale);
              const isCurrentBuild =
                compareVersions(currentVersion, release.version) === 0;
              return (
                <li
                  key={release.version || index}
                  className="rounded-lg border p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={release.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xl font-bold tracking-tight transition-colors hover:text-primary"
                    >
                      v{release.version}
                    </a>
                    {index === 0 && <Badge>{t("latest")}</Badge>}
                    {isCurrentBuild && (
                      <Badge variant="outline">{t("thisBuild")}</Badge>
                    )}
                  </div>
                  {release.summary && (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {release.summary}
                    </p>
                  )}
                  {release.publishedAt && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(release.publishedAt, locale)}
                      {relative ? ` · ${relative}` : ""}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
            {t("noReleases")}
          </p>
        )}
      </motion.div>
    </div>
  );
}
