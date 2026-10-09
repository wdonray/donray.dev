import { NextResponse } from "next/server";
import { clientIpFromHeaders, isRateLimited } from "@/lib/analytics";
import { getHzcStats } from "@/lib/hzc-analytics";
import { reportError } from "@/lib/report-error";

/**
 * GET /api/hzc-stats
 *
 * Returns hidezerocards.org's all-time page views and true unique visitors.
 * Used client-side on the Hide Zero Cards project page so the page builds
 * without AWS credentials and the counts stay live instead of going stale
 * at build time. The numbers are already public on hidezerocards.org/analytics.
 */
export async function GET(request: Request) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`hzc-stats:${ip}`)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const stats = await getHzcStats();
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
      location: "ApiHzcStats.GET",
      extra: { route: "/api/hzc-stats", status: 503 },
    });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
