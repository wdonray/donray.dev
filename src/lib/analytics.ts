import { createHash } from "node:crypto";
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

/**
 * Privacy-respecting page-view analytics backed by DynamoDB.
 *
 * Design:
 * - One item per page for all-time totals:   pk = "PAGE#<path>", sk = "TOTAL"
 * - One item per page per day for uniques:   pk = "PAGE#<path>", sk = "DAY#<yyyy-mm-dd>"
 *   with a `visitors` string-set of salted visitor hashes and a TTL (`expiresAt`).
 * - One item per day for site-wide uniques:  pk = "SITE", sk = "DAY#<yyyy-mm-dd>"
 *   so the headline unique-visitor count dedupes across pages (a visitor who
 *   reads three pages in a day counts once, not three times).
 * - Raw IPs are never stored. A visitor is identified by
 *   SHA-256(salt | ip | user-agent | date), so hashes rotate daily and
 *   cannot be reversed into an IP.
 * - Known bots/crawlers are filtered before recording.
 */

const TABLE_ENV = "ANALYTICS_TABLE";
const REGION_ENV = "ANALYTICS_AWS_REGION";
const KEY_ENV = "ANALYTICS_AWS_ACCESS_KEY_ID";
const SECRET_ENV = "ANALYTICS_AWS_SECRET_ACCESS_KEY";
const SALT_ENV = "ANALYTICS_SALT";

const DAY_TTL_SECONDS = 400 * 24 * 60 * 60; // ~13 months of daily history

const BOT_PATTERN =
  /(bot|crawl|spider|slurp|mediapartners|baidu|yandex|sogou|duckduck|ahrefs|semrush|mj12|dotbot|petal|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|slackbot|discordbot|telegrambot|whatsapp|google-inspection|chrome-lighthouse|headless)/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}

/** Normalize a tracked path: must be a site-relative path, no query/hash. */
export function normalizePath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.length > 200) return null;
  if (trimmed.includes("?") || trimmed.includes("#")) return null;
  // Reject paths with characters that would be odd in a URL path.
  if (/[<>"\\]/.test(trimmed)) return null;
  return trimmed === "" ? null : trimmed;
}

export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10); // yyyy-mm-dd (UTC)
}

/** Salted, non-reversible visitor identifier for one page-day. */
export function hashVisitor(
  salt: string,
  ip: string,
  userAgent: string,
  day: string,
): string {
  return createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}|${day}`)
    .digest("hex");
}

/** Best-effort client IP behind Amplify/CloudFront. */
export function clientIpFromHeaders(
  headers: Headers | Record<string, string | null | undefined>,
): string {
  const get = (name: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name);
    }
    const value = (headers as Record<string, string | null | undefined>)[name];
    return value ?? null;
  };
  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return get("x-real-ip") ?? "unknown";
}

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

/**
 * Record one page view. Returns false when analytics is not configured
 * or the hit was filtered (bot); true when recorded.
 */
export async function recordPageView(
  rawPath: string,
  ip: string,
  userAgent: string,
  now: Date = new Date(),
): Promise<boolean> {
  const path = normalizePath(rawPath);
  if (!path) return false;
  if (isBot(userAgent)) return false;
  const config = getConfig();
  if (!config) return false;

  const client = getClient(config);
  const day = dayKey(now);
  const visitor = hashVisitor(config.salt, ip, userAgent, day);
  const expiresAt = Math.floor(now.getTime() / 1000) + DAY_TTL_SECONDS;

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
    // Daily uniques for the page (idempotent set-add).
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: pkFor(path), sk: `DAY#${day}` },
        UpdateExpression:
          "ADD #views :one, #visitors :visitor SET #path = if_not_exists(#path, :path), #day = if_not_exists(#day, :day), #expires = if_not_exists(#expires, :expires)",
        ExpressionAttributeNames: {
          "#views": "views",
          "#visitors": "visitors",
          "#path": "path",
          "#day": "day",
          "#expires": "expiresAt",
        },
        ExpressionAttributeValues: {
          ":one": 1,
          ":visitor": new Set([visitor]),
          ":path": path,
          ":day": day,
          ":expires": expiresAt,
        },
      }),
    ),
    // Site-wide daily uniques (same visitor hash, so a visitor who reads
    // several pages in one day counts once here).
    client.send(
      new UpdateCommand({
        TableName: config.table,
        Key: { pk: "SITE", sk: `DAY#${day}` },
        UpdateExpression:
          "ADD #visitors :visitor SET #day = if_not_exists(#day, :day), #expires = if_not_exists(#expires, :expires)",
        ExpressionAttributeNames: {
          "#visitors": "visitors",
          "#day": "day",
          "#expires": "expiresAt",
        },
        ExpressionAttributeValues: {
          ":visitor": new Set([visitor]),
          ":day": day,
          ":expires": expiresAt,
        },
      }),
    ),
  ]);
  return true;
}

export interface DailyStat {
  day: string;
  views: number;
  uniques: number;
}

export interface PageStat {
  path: string;
  totalViews: number;
  daily: DailyStat[];
  uniquesLast30d: number;
}

export interface AnalyticsSummary {
  pages: PageStat[];
  totalViews: number;
  /** Sum of site-wide daily unique visitors (deduped across pages). */
  totalUniques: number;
  dailyTotals: DailyStat[];
  fetchedAt: string;
}

/**
 * Read the analytics table for the public dashboard. Returns null when
 * analytics is not configured (local dev / CI without credentials).
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
      stat = { path, totalViews: 0, daily: [], uniquesLast30d: 0 };
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

  const siteDailyUniques = new Map<string, number>();

  for (const item of items) {
    const pk = item.pk as string | undefined;
    const sk = item.sk as string | undefined;
    if (pk === "SITE" && sk?.startsWith("DAY#")) {
      const day = sk.slice("DAY#".length);
      if (day >= cutoffDay) siteDailyUniques.set(day, countUniques(item));
      continue;
    }
    if (!pk?.startsWith("PAGE#")) continue;
    const path = (item.path as string) ?? pk.slice("PAGE#".length);
    const stat = ensure(path);
    if (sk === "TOTAL") {
      stat.totalViews = (item.views as number) ?? 0;
    } else if (sk?.startsWith("DAY#")) {
      const day = sk.slice("DAY#".length);
      if (day >= cutoffDay) {
        stat.daily.push({
          day,
          views: (item.views as number) ?? 0,
          uniques: countUniques(item),
        });
      }
    }
  }

  for (const stat of byPage.values()) {
    stat.daily.sort((a, b) => (a.day < b.day ? -1 : 1));
    stat.uniquesLast30d = stat.daily.reduce((sum, d) => sum + d.uniques, 0);
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
        uniques: 0,
      };
      total.views += d.views;
      total.uniques += d.uniques;
      dailyTotals.set(d.day, total);
    }
  }

  return {
    pages,
    totalViews,
    totalUniques: [...siteDailyUniques.values()].reduce(
      (sum, n) => sum + n,
      0,
    ),
    dailyTotals: [...dailyTotals.values()].sort((a, b) =>
      a.day < b.day ? -1 : 1,
    ),
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
