import type { Metadata } from "next";
import { version } from "../../../package.json";
import VersionInfo, {
  RELEASES_API,
  RELEASES_URL,
  type LatestRelease,
} from "@/components/version-info";

export const metadata: Metadata = {
  title: "Version | donray.dev",
  description:
    "The build currently running on donray.dev, compared against the latest published release.",
};

async function getLatestRelease(): Promise<LatestRelease | null> {
  try {
    // Cache for an hour: the GitHub API allows only 60 unauthenticated
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
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      version: String(data.tag_name ?? "").replace(/^v/i, ""),
      url: data.html_url ?? RELEASES_URL,
      publishedAt: data.published_at ?? null,
    };
  } catch {
    return null;
  }
}

export default async function VersionPage() {
  const initialLatest = await getLatestRelease();

  return (
    <div className="min-h-screen flex items-start justify-center px-4 md:px-16 pt-28 pb-16">
      <VersionInfo currentVersion={version} initialLatest={initialLatest} />
    </div>
  );
}
