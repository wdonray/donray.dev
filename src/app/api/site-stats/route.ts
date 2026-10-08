import { NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  getAnalyticsSummary,
  isRateLimited,
} from "@/lib/analytics";

/**
 * GET /api/site-stats
 *
 * Returns donray.dev's all-time page views and true unique visitors.
 * Used client-side on the donray.dev project page so the page builds
 * without AWS credentials and the counts stay live instead of going
 * stale at build time. The numbers are already public on /analytics.
 */
export async function GET(request: Request) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`site-stats:${ip}`)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const summary = await getAnalyticsSummary(30);
    if (!summary) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json(
      {
        pageViews: summary.totalViews,
        uniqueVisitors: summary.totalUniques,
      },
      {
        headers: {
          // Counts change slowly; cache briefly at the edge.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
