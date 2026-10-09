import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SITE_UNIQUES_PK, UNIQUES_SK_V2 } from "@wdonray/analytics-core/server";

/**
 * Read-only access to patternspell.org's analytics table.
 *
 * Both sites live in the same AWS account. donray.dev's analytics IAM user
 * is granted read access to the PatternSpell analytics table so the
 * PatternSpell project page can show live stats. The table name comes from PS_ANALYTICS_TABLE;
 * region and credentials are shared with donray.dev's own analytics config.
 *
 * Data model matches src/lib/analytics.ts:
 * - pk = "PAGE#<path>", sk = "TOTAL"      -> all-time views per page
 * - pk = "SITE", sk = "UNIQUES_V2"         -> site-wide engaged unique visitors
 */

const TABLE_ENV = "PS_ANALYTICS_TABLE";
const REGION_ENV = "ANALYTICS_AWS_REGION";
const KEY_ENV = "ANALYTICS_AWS_ACCESS_KEY_ID";
const SECRET_ENV = "ANALYTICS_AWS_SECRET_ACCESS_KEY";

export interface PsStats {
  pageViews: number;
  uniqueVisitors: number;
}

interface PsConfig {
  table: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function getPsConfig(): PsConfig | null {
  const table = process.env[TABLE_ENV];
  const region = process.env[REGION_ENV];
  const accessKeyId = process.env[KEY_ENV];
  const secretAccessKey = process.env[SECRET_ENV];
  if (!table || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { table, region, accessKeyId, secretAccessKey };
}

let docClient: DynamoDBDocumentClient | null = null;

function getClient(config: PsConfig): DynamoDBDocumentClient {
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
export function __resetPsClientForTests(): void {
  docClient = null;
}

// Counts change slowly; the API route also sets edge caching.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { stats: PsStats; at: number } | null = null;

/** For tests: clear the stats cache. */
export function __resetPsCacheForTests(): void {
  cached = null;
}

/**
 * All-time page views and true unique visitors for patternspell.org.
 * Returns null when the PatternSpell analytics table is not configured (local dev / CI).
 * Results are cached in memory for 5 minutes.
 */
export async function getPsStats(
  now: number = Date.now(),
): Promise<PsStats | null> {
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.stats;
  }
  const config = getPsConfig();
  if (!config) return null;
  const client = getClient(config);

  // The table is tiny (one item per page + one per page-day), so a Scan is fine.
  let totalViews = 0;
  let uniqueVisitors = 0;
  let exclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await client.send(
      new ScanCommand({
        TableName: config.table,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    for (const item of (res.Items ?? []) as Record<string, unknown>[]) {
      const pk = item.pk as string | undefined;
      const sk = item.sk as string | undefined;
      if (pk === SITE_UNIQUES_PK && sk === UNIQUES_SK_V2) {
        const visitors = item.visitors as string[] | Set<string> | undefined;
        uniqueVisitors = Array.isArray(visitors)
          ? visitors.length
          : visitors instanceof Set
            ? visitors.size
            : 0;
      } else if (pk?.startsWith("PAGE#") && sk === "TOTAL") {
        totalViews += (item.views as number) ?? 0;
      }
    }
    exclusiveStartKey = res.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (exclusiveStartKey);

  const stats = { pageViews: totalViews, uniqueVisitors };
  cached = { stats, at: now };
  return stats;
}
