"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewVersionAvailable } from "@/hooks/use-new-version";

/**
 * Small bottom-right toast shown when a newer deploy is detected.
 * Mounted once in the root layout (via ClientLayout) so it is active on
 * every page. Dismissing hides it for the current page session only;
 * it reappears on the next page load while the app is still stale.
 *
 * `onReload` defaults to a normal window.location.reload(). It is a prop
 * so tests can observe the click without navigating.
 */
export default function VersionReloadToast({
  onReload = () => window.location.reload(),
}: {
  onReload?: () => void;
} = {}) {
  const updateAvailable = useNewVersionAvailable();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!updateAvailable || dismissed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [updateAvailable, dismissed]);

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg"
    >
      <p className="leading-snug">
        A new version is available. Reload to get the latest.
      </p>
      <Button type="button" className="min-h-11 shrink-0" onClick={onReload}>
        Reload
      </Button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
