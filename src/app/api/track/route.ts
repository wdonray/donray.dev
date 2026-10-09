import { NextResponse } from "next/server";
import {
  clientIpFromHeaders,
  isRateLimited,
  normalizePath,
  recordEngagedVisitor,
  recordPageView,
} from "@/lib/analytics";
import { reportError } from "@/lib/report-error";

/**
 * POST /api/track { path: "/some/page", engaged?: boolean }
 *
 * Records one page view. When engaged is true, also records the visitor
 * in the engaged-unique set (client sends this after detecting a scroll,
 * proving a human is present). Bots are filtered, and the client dedupes
 * to one hit per page per browsing session: this endpoint is the last
 * line of defense, not the only one.
 */
export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get("user-agent") ?? "";
    const ip = clientIpFromHeaders(request.headers);

    // Basic abuse protection: cap writes per IP so the endpoint can't be
    // used to inflate stats or run up DynamoDB costs.
    if (isRateLimited(`track:${ip}`)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
      engaged?: unknown;
    } | null;
    const path = normalizePath(
      typeof body?.path === "string" ? body.path : null,
    );
    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await recordPageView(path, ip, userAgent);
    if (body?.engaged === true) {
      await recordEngagedVisitor(path, ip, userAgent);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Analytics must never break the site.
    reportError(error, {
      location: "ApiTrack.POST",
      extra: { route: "/api/track", status: 200 },
    });
    return NextResponse.json({ ok: true });
  }
}
