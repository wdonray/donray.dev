import * as Sentry from "@sentry/nextjs";

type ReportErrorOptions = {
  /** Where the error happened, e.g. "Header.handleMenuPhotoSelect" */
  location?: string;
  /** Extra structured context */
  extra?: Record<string, unknown>;
};

/**
 * Report an error to Sentry with a location tag and optional extras.
 * Every caught error in the app goes through here: there is no value in
 * swallowing an error silently.
 *
 * Safe to call anywhere (client or server). When Sentry has no DSN
 * configured, captureException is a no-op.
 */
export function reportError(
  error: unknown,
  options: ReportErrorOptions = {},
): void {
  // Aborted requests are benign user/system behavior, not errors.
  if (error instanceof DOMException && error.name === "AbortError") return;
  const err = error instanceof Error ? error : new Error(String(error));
  Sentry.withScope((scope) => {
    if (options.location) scope.setTag("location", options.location);
    if (options.extra) scope.setExtras(options.extra);
    Sentry.captureException(err);
  });
}
