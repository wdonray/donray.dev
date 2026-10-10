import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
// Pure functions (hashing, bot detection, IP extraction, path utils,
// rate limiting) live in the shared @wdonray/analytics-core package so
// the visitor-identification algorithm is byte-identical across all sites.
import {
  SITE_UNIQUES_PK,
  UNIQUES_SK_V2,
  clientIpFromHeaders,
  createRateLimiter,
  dayKey,
  hashVisitor,
  isBotUserAgent,
  normalizePath,
} from "@wdonray/analytics-core/server";

/**
 * Privacy-respecting page-view analytics backed by DynamoDB.
 *
 * Design:
 * - One item per page for all-time totals:   pk = "PAGE#<path>", sk = "TOTAL"
 * - One item per page per day for the chart: pk = "PAGE#<path>", sk = "DAY#<yyyy-mm-dd>"
 *   with a `views` counter.
 * - One item per page for engaged unique visitors: pk = "PAGE#<path>", sk = "UNIQUES_V2"
 *   with a `visitors` string-set of salted visitor hashes (kept permanently).
 *   Only humans who scrolled (client-side engagement gate) are recorded here.
 * - One item for site-wide engaged unique visitors: pk = "SITE", sk = "UNIQUES_V2"
 *   so the headline count dedupes across pages (a visitor who reads three
 *   pages counts once, not three times).
 * - Raw IPs are never stored. A visitor is identified by
 *   SHA-256(salt | ip | user-agent): stable over time, so a visitor who
 *   returns a year later still counts once, and non-reversible, so the
 *   hash cannot be turned back into an IP.
 * - All records are kept permanently (no TTL). The table is tiny and
 *   storage costs are negligible.
 *
 * V2 keys exist because the original UNIQUES sets were polluted with bot
 * hashes before engagement gating. Page-view history (TOTAL, DAY#) is
 * untouched. Dashboard reads sum V1 and V2 uniques so historical counts
 * are preserved; new engaged visitors accumulate in V2 only.
 */

// Re-export library pure functions so existing imports keep working.
export {
  clientIpFromHeaders,
  dayKey,
  hashVisitor,
  isBotUserAgent,
  normalizePath,
};

const TABLE_ENV = "ANALYTICS_TABLE";
const REGION_ENV = "ANALYTICS_AWS_REGION";
const KEY_ENV = "ANALYTICS_AWS_ACCESS_KEY_ID";
const SECRET_ENV = "ANALYTICS_AWS_SECRET_ACCESS_KEY";
const SALT_ENV = "ANALYTICS_SALT";

interface AnalyticsConfig {
  table: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  salt: string;
}

export function getConfig(): AnalyticsConfig | null {
  const table = process.env[TABLE_ENV];
  const region = process.env[REGION_ENV];
  const accessKeyId = process.env[KEY_ENV];
  const secretAccessKey = process.env[SECRET_ENV];
  const salt = process.env[SALT_ENV];
  if (!table || !region || !accessKeyId || !secretAccessKey || !salt) {
    return null;
  }
  return { table, region, accessKeyId, secretAccessKey, salt };
}

let docClient: DynamoDBDocumentClient | null = null;

function getClient(config: AnalyticsConfig): DynamoDBDocumentClient {
  if (!docClient) {
    const clientConfig: DynamoDBClientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };
    docClient = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return docClient;
}

/** For tests: reset the cached client. */
export function __resetClientForTests(): void {
  docClient = null;
}

const pkFor = (path: string) => `PAGE#${path}`;

/** Compare daily stats by day ascending (for sort). */
export function compareDays(a: { day: string }, b: { day: string }): number {
  return a.day < b.day ? -1 : 1;
}

/**
 * Record one page view (TOTAL and DAY# counters only).
 * Returns false when analytics is not configured or the hit was filtered
 * (bot or invalid path); true when recorded.
 *
 * Unique visitors are recorded separately via recordEngagedVisitor, only
 * when the client reports a human engagement signal (scroll).
 */
export async function recordPageView(
  rawPath: string,
  ip: string,
  userAgent: string,
  now: Date = new Date(),
): Promise<boolean> {
  const path = normalizePath(rawPath);
  if (!path) return false;
  if (isBotUserAgent(userAgent)) return false;
  const config = getConfig();
  if (!config) return false;

  const client = getClient(config);
  const day = dayKey(now);

  await Promise.all([
    // All-time total for the page.
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: "TOTAL" },
        UpdateExpression:
          "ADD #views :one SET #path = if_not_exists(#path, :path)",
        ExpressionAttributeNames: { "#views": "views", "#path": "path" },
        ExpressionAttributeValues: { ":one": 1, ":path": path },
      }),
    ),
    // Daily view count for the page (powers the per-day chart).
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: `DAY#${day}` },
        UpdateExpression:
          "ADD #views :one SET #path = if_not_exists(#path, :path), #day = if_not_exists(#day, :day)",
        ExpressionAttributeNames: {
          "#views": "views",
          "#path": "path",
          "#day": "day",
        },
        ExpressionAttributeValues: {
          ":one": 1,
          ":path": path,
          ":day": day,
        },
      }),
    ),
  ]);
  return true;
}

/**
 * Record an engaged unique visitor (UNIQUES_V2 sets only).
 * Call this only when the client reports a human engagement signal
 * (scroll). Idempotent: a returning visitor adds the same hash again,
 * so the set size is the true human-unique count.
 * Returns false when analytics is not configured or the input is invalid.
 */
export async function recordEngagedVisitor(
  rawPath: string,
  ip: string,
  userAgent: string,
): Promise<boolean> {
  const path = normalizePath(rawPath);
  if (!path) return false;
  if (isBotUserAgent(userAgent)) return false;
  const config = getConfig();
  if (!config) return false;

  const client = getClient(config);
  const visitor = hashVisitor(config.salt, ip, userAgent);

  await Promise.all([
    // Engaged unique visitors for the page.
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: UNIQUES_SK_V2 },
        UpdateExpression:
          "ADD #visitors :visitor SET #path = if_not_exists(#path, :path)",
        ExpressionAttributeNames: {
          "#visitors": "visitors",
          "#path": "path",
        },
        ExpressionAttributeValues: {
          ":visitor": new Set([visitor]),
          ":path": path,
        },
      }),
    ),
    // Site-wide engaged unique visitors (same visitor hash, so a visitor
    // who reads several pages counts once here).
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: SITE_UNIQUES_PK, sk: UNIQUES_SK_V2 },
        UpdateExpression: "ADD #visitors :visitor",
        ExpressionAttributeNames: {
          "#visitors": "visitors",
        },
        ExpressionAttributeValues: {
          ":visitor": new Set([visitor]),
        },
      }),
    ),
  ]);
  return true;
}

export interface DailyStat {
  day: string;
  views: number;
}

export interface PageStat {
  path: string;
  totalViews: number;
  daily: DailyStat[];
  uniques: number;
}

export interface AnalyticsSummary {
  pages: PageStat[];
  totalViews: number;
  /** Engaged site-wide unique visitors (deduped across pages and time). */
  totalUniques: number;
  dailyTotals: DailyStat[];
  fetchedAt: string;
}

/**
 * Read the analytics table for the public dashboard. Returns null when
 * analytics is not configured (local dev / CI without credentials).
 * Unique-visitor counts come from the V2 (engagement-gated) sets.
 */
export async function getAnalyticsSummary(
  days = 30,
  now: Date = new Date(),
): Promise<AnalyticsSummary | null> {
  const config = getConfig();
  if (!config) return null;
  const client = getClient(config);

  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  const cutoffDay = dayKey(cutoff);

  // The table is tiny (one item per page + one per page-day), so a Scan is fine.
  const items: Record<string, unknown>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await client.send(
      new ScanCommand({
        TableName: config.table,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    items.push(...((res.Items ?? []) as Record<string, unknown>[]));
    exclusiveStartKey = res.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (exclusiveStartKey);

  const byPage = new Map<string, PageStat>();
  const ensure = (path: string): PageStat => {
    let stat = byPage.get(path);
    if (!stat) {
      stat = { path, totalViews: 0, daily: [], uniques: 0 };
      byPage.set(path, stat);
    }
    return stat;
  };
  const countUniques = (item: Record<string, unknown>): number => {
    const visitors = item.visitors as string[] | Set<string> | undefined;
    return Array.isArray(visitors)
      ? visitors.length
      : visitors instanceof Set
        ? visitors.size
        : 0;
  };

  // V1 holds pre-cutover history, V2 holds post-cutover engaged uniques.
  // Sum both so the dashboard keeps showing historical counts.
  let siteUniquesV1 = 0;
  let siteUniquesV2 = 0;

  for (const item of items) {
    const pk = item.pk as string | undefined;
    const sk = item.sk as string | undefined;
    if (pk === SITE_UNIQUES_PK) {
      if (sk === "UNIQUES") {
        siteUniquesV1 = countUniques(item);
        continue;
      }
      if (sk === UNIQUES_SK_V2) {
        siteUniquesV2 = countUniques(item);
        continue;
      }
    }
    if (!pk?.startsWith("PAGE#")) continue;
    const path = (item.path as string) ?? pk.slice("PAGE#".length);
    const stat = ensure(path);
    if (sk === "TOTAL") {
      stat.totalViews = (item.views as number) ?? 0;
    } else if (sk === "UNIQUES" || sk === UNIQUES_SK_V2) {
      stat.uniques += countUniques(item);
    } else if (sk?.startsWith("DAY#")) {
      const day = sk.slice("DAY#".length);
      if (day >= cutoffDay) {
        stat.daily.push({
          day,
          views: (item.views as number) ?? 0,
        });
      }
    }
  }

  for (const stat of byPage.values()) {
    stat.daily.sort(compareDays);
  }

  const pages = [...byPage.values()].sort(
    (a, b) => b.totalViews - a.totalViews,
  );
  const totalViews = pages.reduce((sum, p) => sum + p.totalViews, 0);

  const dailyTotals = new Map<string, DailyStat>();
  for (const page of pages) {
    for (const d of page.daily) {
      const total = dailyTotals.get(d.day) ?? {
        day: d.day,
        views: 0,
      };
      total.views += d.views;
      dailyTotals.set(d.day, total);
    }
  }

  return {
    pages,
    totalViews,
    totalUniques: siteUniquesV1 + siteUniquesV2,
    dailyTotals: [...dailyTotals.values()].sort(compareDays),
    fetchedAt: now.toISOString(),
  };
}

/** Fetch a single page's all-time total (used by small badges/embeds). */
export async function getPageTotalViews(path: string): Promise<number | null> {
  const config = getConfig();
  if (!config) return null;
  const client = getClient(config);
  const res = await client.send(
    new GetCommand({
      TableName: config.table,
      Key: { pk: pkFor(path), sk: "TOTAL" },
    }),
  );
  const item = res.Item as { views?: number } | undefined;
  return item?.views ?? 0;
}

/**
 * True unique visitors for a page: the size of its persistent visitor set.
 * Sums the V1 (pre-cutover history) and V2 (engaged-only) sets so the
 * dashboard keeps showing historical counts. A visitor who returns any
 * number of times still counts once per set.
 */
export async function getPageUniqueViews(path: string): Promise<number | null> {
  const config = getConfig();
  if (!config) return null;
  const client = getClient(config);
  const countVisitors = (item: unknown): number => {
    const visitors = (item as { visitors?: string[] | Set<string> } | undefined)
      ?.visitors;
    if (!visitors) return 0;
    return Array.isArray(visitors) ? visitors.length : visitors.size;
  };
  const [v1, v2] = await Promise.all([
    client.send(
      new GetCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: "UNIQUES" },
      }),
    ),
    client.send(
      new GetCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: UNIQUES_SK_V2 },
      }),
    ),
  ]);
  return countVisitors(v1.Item) + countVisitors(v2.Item);
}

/* ------------------------------------------------------------------ */
/* Rate limiting for the /api/track endpoint, backed by the shared     */
/* library. Protects DynamoDB from abuse: an attacker spamming the     */
/* endpoint could otherwise inflate stats or run up AWS write costs.   */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window per key

let rateLimiter = createRateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
});

/**
 * Returns true when the key has exceeded the rate limit.
 */
export function isRateLimited(key: string, now: number = Date.now()): boolean {
  return rateLimiter(key, now);
}

/** For tests: clear all rate-limit state. */
export function __resetRateLimitForTests(): void {
  rateLimiter = createRateLimiter({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });
}
