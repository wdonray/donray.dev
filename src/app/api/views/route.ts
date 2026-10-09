import { NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  getPageTotalViews,
  isRateLimited,
  normalizePath,
} from "@/lib/analytics";
import { reportError } from "@/lib/report-error";

/**
 * GET /api/views?path=/blog/some-post
 *
 * Returns the all-time tracked view count for a path.
 * Used client-side so pages build without AWS credentials
 * and counts stay live instead of going stale at build time.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = normalizePath(url.searchParams.get("path"));
    if (!path) {
      return NextResponse.json({ views: null }, { status: 400 });
    }

    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`views:${ip}`)) {
      return NextResponse.json({ views: null }, { status: 429 });
    }

    const views = await getPageTotalViews(path);
    return NextResponse.json(
      { views },
      {
        headers: {
          // Counts change slowly; cache briefly at the edge.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    reportError(error, {
      location: "ApiViews.GET",
      extra: { route: "/api/views", status: 200 },
    });
    return NextResponse.json({ views: null });
  }
}
