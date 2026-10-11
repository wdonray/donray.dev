import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Read-only access to PatternSpell's user count for the project page.
 *
 * PatternSpell stores user profiles in DynamoDB (table `c-shepherd-users`),
 * not in Cognito — the Cognito pools are auth-only and empty. Counting
 * via Scan gives the current number of registered users.
 *
 * The table name comes from PS_USERS_TABLE (defaults to `c-shepherd-users`);
 * region and credentials are shared with donray.dev's analytics config
 * (ANALYTICS_AWS_*). The analytics IAM user needs dynamodb:Scan on the
 * PatternSpell users table.
 */

const TABLE_ENV = "PS_USERS_TABLE";
const DEFAULT_TABLE = "c-shepherd-users";
const REGION_ENV = "ANALYTICS_AWS_REGION";
const KEY_ENV = "ANALYTICS_AWS_ACCESS_KEY_ID";
const SECRET_ENV = "ANALYTICS_AWS_SECRET_ACCESS_KEY";

interface PsUsersConfig {
  table: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function getPsUsersConfig(): PsUsersConfig | null {
  const table = process.env[TABLE_ENV] || DEFAULT_TABLE;
  const region = process.env[REGION_ENV];
  const accessKeyId = process.env[KEY_ENV];
  const secretAccessKey = process.env[SECRET_ENV];
  if (!region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { table, region, accessKeyId, secretAccessKey };
}

let docClient: DynamoDBDocumentClient | null = null;

function getClient(config: PsUsersConfig): DynamoDBDocumentClient {
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
export function __resetPsUsersClientForTests(): void {
  docClient = null;
}

// Signups change slowly; the API route also sets edge caching.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { count: number; at: number } | null = null;
// In-flight request shared across concurrent callers to avoid DynamoDB
// throttling when several visitors hit a cold cache at once.
let inFlight: Promise<number | null> | null = null;

/** For tests: clear the signup count cache. */
export function __resetPsSignupCacheForTests(): void {
  cached = null;
  inFlight = null;
}

/**
 * Current PatternSpell user count (profiles in the DynamoDB users table).
 * Returns null when not configured (local dev / CI).
 * Results are cached in memory for 5 minutes. Concurrent callers share
 * a single in-flight request.
 */
export async function getPsSignupCount(
  now: number = Date.now(),
): Promise<number | null> {
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.count;
  }
  if (inFlight) {
    return inFlight;
  }
  inFlight = fetchCount(now);
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

async function fetchCount(now: number): Promise<number | null> {
  const config = getPsUsersConfig();
  if (!config) return null;
  const client = getClient(config);

  // The users table is tiny; a Scan with Select=COUNT is fine.
  let count = 0;
  let exclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await client.send(
      new ScanCommand({
        TableName: config.table,
        Select: "COUNT",
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    count += res.Count ?? 0;
    exclusiveStartKey = res.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (exclusiveStartKey);

  cached = { count, at: now };
  return count;
}

// Back-compat aliases for the Cognito-era names used in tests.
export const getPsCognitoConfig = getPsUsersConfig;
export const __resetPsCognitoClientForTests = __resetPsUsersClientForTests;
