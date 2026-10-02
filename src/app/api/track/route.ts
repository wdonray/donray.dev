import { NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  normalizePath,
  recordPageView,
} from "@/lib/analytics";

/**
 * POST /api/track { path: "/some/page" }
 *
 * Records one page view. Bots are filtered, and the client dedupes to one
 * hit per page per browsing session — this endpoint is the last line of
 * defense, not the only one.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
    } | null;
    const path = normalizePath(
      typeof body?.path === "string" ? body.path : null,
    );
    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const ip = clientIpFromHeaders(request.headers);
    await recordPageView(path, ip, userAgent);
    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break the site.
    return NextResponse.json({ ok: true });
  }
}
