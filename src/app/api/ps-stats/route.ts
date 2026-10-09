import { NextResponse } from "next/server";
import { clientIpFromHeaders, isRateLimited } from "@/lib/analytics";
import { getPsStats } from "@/lib/ps-analytics";
import { reportError } from "@/lib/report-error";

/**
 * GET /api/ps-stats
 *
 * Returns patternspell.org's all-time page views and true unique visitors.
 * Used client-side on the PatternSpell project page so the page builds
 * without AWS credentials and the counts stay live instead of going stale
 * at build time. The numbers are already public on patternspell.org/analytics.
 */
export async function GET(request: Request) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`ps-stats:${ip}`)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const stats = await getPsStats();
    if (!stats) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json(stats, {
      headers: {
        // Counts change slowly; cache briefly at the edge.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    reportError(error, {
      location: "ApiPsStats.GET",
      extra: { route: "/api/ps-stats", status: 503 },
    });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
