import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type CognitoIdentityProviderClientConfig,
} from "@aws-sdk/client-cognito-identity-provider";
import { captureMessage } from "@sentry/nextjs";

/**
 * Read-only access to PatternSpell's Cognito user pool for user counts.
 *
 * The pool ('patternspell-users', us-east-1) is the source of truth for
 * users: it holds both email/password and Google OAuth users. Counting
 * via ListUsers (paginated) gives the current number of user profiles
 * in the pool.
 *
 * The pool ID comes from PS_COGNITO_USER_POOL_ID; region and credentials
 * are shared with donray.dev's analytics config (ANALYTICS_AWS_*). The
 * analytics IAM user needs cognito-idp:ListUsers on the PatternSpell pool.
 */

const POOL_ENV = "PS_COGNITO_USER_POOL_ID";
const REGION_ENV = "ANALYTICS_AWS_REGION";
const KEY_ENV = "ANALYTICS_AWS_ACCESS_KEY_ID";
const SECRET_ENV = "ANALYTICS_AWS_SECRET_ACCESS_KEY";

interface PsCognitoConfig {
  userPoolId: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function getPsCognitoConfig(): PsCognitoConfig | null {
  const userPoolId = process.env[POOL_ENV];
  const region = process.env[REGION_ENV];
  const accessKeyId = process.env[KEY_ENV];
  const secretAccessKey = process.env[SECRET_ENV];
  if (!userPoolId || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { userPoolId, region, accessKeyId, secretAccessKey };
}

let client: CognitoIdentityProviderClient | null = null;

function getClient(config: PsCognitoConfig): CognitoIdentityProviderClient {
  if (!client) {
    const clientConfig: CognitoIdentityProviderClientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };
    client = new CognitoIdentityProviderClient(clientConfig);
  }
  return client;
}

/** For tests: reset the cached client. */
export function __resetPsCognitoClientForTests(): void {
  client = null;
}

// Signups change slowly; the API route also sets edge caching.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { count: number; at: number } | null = null;
// In-flight request shared across concurrent callers to avoid Cognito
// throttling when several visitors hit a cold cache at once.
let inFlight: Promise<number | null> | null = null;

/** For tests: clear the signup count cache. */
export function __resetPsSignupCacheForTests(): void {
  cached = null;
  inFlight = null;
}

/**
 * Current PatternSpell user count (profiles in the Cognito pool).
 * Returns null when the pool is not configured (local dev / CI).
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
  const config = getPsCognitoConfig();
  if (!config) {
    // Fail visibly in production: a missing env var silently returns null,
    // which took a full debugging session to diagnose. Warn via Sentry so
    // the next missing-var incident is obvious.
    if (process.env.NODE_ENV === "production") {
      captureMessage("ps-cognito: missing env config", "warning");
    }
    return null;
  }
  const cognito = getClient(config);

  // ListUsers caps at 60 per page; paginate to count the whole pool.
  let count = 0;
  let paginationToken: string | undefined;
  do {
    const res = await cognito.send(
      new ListUsersCommand({
        UserPoolId: config.userPoolId,
        Limit: 60,
        PaginationToken: paginationToken,
      }),
    );
    count += res.Users?.length ?? 0;
    paginationToken = res.PaginationToken;
  } while (paginationToken);

  cached = { count, at: now };
  return count;
}
