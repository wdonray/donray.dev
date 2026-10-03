import { NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  getPageUniqueViews,
  isRateLimited,
  normalizePath,
} from "@/lib/analytics";

/**
 * GET /api/views?path=/blog/some-post
 *
 * Returns the summed daily unique readers for a path.
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

    const views = await getPageUniqueViews(path);
    return NextResponse.json(
      { views },
      {
        headers: {
          // Counts change slowly; cache briefly at the edge.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ views: null });
  }
}
