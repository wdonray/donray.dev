import { NextResponse } from "next/server";
import { clientIpFromHeaders, isRateLimited } from "@/lib/analytics";
import { getPsStats } from "@/lib/ps-analytics";
import { getPsSignupCount } from "@/lib/ps-cognito";
import { reportError } from "@/lib/report-error";

/**
 * GET /api/ps-stats
 *
 * Returns patternspell.org's all-time page views, true unique visitors,
 * and Cognito signup count. Used client-side on the PatternSpell project
 * page so the page builds without AWS credentials and the counts stay live
 * instead of going stale at build time. The analytics numbers are already
 * public on patternspell.org/analytics. `signups` is null when the Cognito
 * pool is not configured; the client hides that card.
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
    // Signups are best-effort: if Cognito is down or misconfigured, still
    // return the analytics stats rather than failing the whole request.
    let signups: number | null = null;
    try {
      signups = await getPsSignupCount();
    } catch (error) {
      reportError(error, {
        location: "ApiPsStats.GET",
        extra: { route: "/api/ps-stats", partial: "signups" },
      });
    }
    return NextResponse.json(
      { ...stats, signups },
      {
        headers: {
          // Counts change slowly; cache briefly at the edge.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    reportError(error, {
      location: "ApiPsStats.GET",
      extra: { route: "/api/ps-stats", status: 503 },
    });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
