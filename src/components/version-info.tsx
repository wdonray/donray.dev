"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Tag,
  TriangleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeInUp, fadeInUpWithDelay } from "@/lib/animations";

export const RELEASES_API =
  "https://api.github.com/repos/wdonray/donray.dev/releases/latest";
export const RELEASES_URL =
  "https://github.com/wdonray/donray.dev/releases";

export interface LatestRelease {
  version: string;
  url: string;
  publishedAt: string | null;
}

type Status = "idle" | "loading" | "up-to-date" | "behind" | "ahead" | "error";

/** Parse a semver-ish string ("v0.4.19" / "0.4.19") into comparable parts. */
function parseVersion(value: string): number[] {
  return value
    .replace(/^v/i, "")
    .split(".")
    .map((part) => parseInt(part, 10) || 0);
}

/** Returns 1 if a > b, -1 if a < b, 0 if equal. */
function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function statusFor(
  current: string,
  latest: LatestRelease | null,
): Exclude<Status, "idle" | "loading"> {
  if (!latest) return "error";
  const comparison = compareVersions(current, latest.version);
  return comparison === 0 ? "up-to-date" : comparison < 0 ? "behind" : "ahead";
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VersionInfo({
  currentVersion,
  initialLatest,
}: {
  currentVersion: string;
  initialLatest: LatestRelease | null;
}) {
  const [latest, setLatest] = useState<LatestRelease | null>(initialLatest);
  const [status, setStatus] = useState<Status>(() =>
    statusFor(currentVersion, initialLatest),
  );

  const checkLatest = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(RELEASES_API, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
      const data = await res.json();
      const next: LatestRelease = {
        version: String(data.tag_name ?? "").replace(/^v/i, ""),
        url: data.html_url ?? RELEASES_URL,
        publishedAt: data.published_at ?? null,
      };
      setLatest(next);
      setStatus(statusFor(currentVersion, next));
    } catch {
      setStatus("error");
    }
  }, [currentVersion]);

  return (
    <div className="w-full max-w-lg space-y-8">
      {/* Heading — mirrors the SectionHeader accent bar + title */}
      <motion.div className="space-y-2" {...fadeInUp}>
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Version</h1>
        <p className="text-muted-foreground">
          The build currently running on donray.dev, compared against the latest
          published release.
        </p>
      </motion.div>

      <motion.div {...fadeInUpWithDelay(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="size-4 text-primary" aria-hidden="true" />
              Release status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Version rows */}
            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">This build</dt>
                <dd className="font-mono text-lg font-semibold">
                  v{currentVersion}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Latest release</dt>
                <dd className="font-mono text-lg font-semibold">
                  {status === "loading" ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span className="text-sm">Checking…</span>
                    </span>
                  ) : latest ? (
                    <a
                      href={latest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      v{latest.version}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unavailable
                    </span>
                  )}
                </dd>
              </div>
              {latest?.publishedAt && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Released</dt>
                  <dd className="text-sm">{formatDate(latest.publishedAt)}</dd>
                </div>
              )}
            </dl>

            {/* Status banner */}
            <StatusBanner status={status} />

            <Button
              variant="outline"
              size="sm"
              onClick={checkLatest}
              disabled={status === "loading"}
              className="w-full cursor-pointer"
            >
              <RefreshCw
                className={`size-4 ${status === "loading" ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Check again
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.p
        className="text-center text-sm text-muted-foreground"
        {...fadeInUpWithDelay(0.3)}
      >
        View the full{" "}
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          release history
        </a>{" "}
        on GitHub.
      </motion.p>
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status === "loading" || status === "idle") return null;

  const config = {
    "up-to-date": {
      icon: Check,
      text: "You're on the latest release.",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    behind: {
      icon: TriangleAlert,
      text: "A newer release is available.",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    ahead: {
      icon: Tag,
      text: "This build is ahead of the latest release (unreleased).",
      className: "bg-muted text-muted-foreground border-border",
    },
    error: {
      icon: TriangleAlert,
      text: "Couldn't reach GitHub to compare versions.",
      className: "bg-muted text-muted-foreground border-border",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium ${config.className}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{config.text}</span>
    </div>
  );
}
