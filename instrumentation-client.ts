import * as Sentry from "@sentry/nextjs";

// Error tracking only. No tracing, no session replay.
// The SDK no-ops when the DSN is undefined (local dev).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
