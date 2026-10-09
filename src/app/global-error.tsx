"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/**
 * Last-resort boundary for errors thrown during rendering. Next.js renders
 * this in place of the whole app (including the root layout), so it
 * defines its own html/body and keeps the styling self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { location: "GlobalError" });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-start justify-center px-4 md:px-16 pt-24 pb-16">
          <div className="w-full max-w-xl space-y-8">
            <div className="space-y-2">
              <div
                className="h-1 w-10 rounded-full bg-primary"
                aria-hidden="true"
              />
              <h1 className="text-3xl font-bold tracking-tight">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Reloading the page usually fixes
                it.
              </p>
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
