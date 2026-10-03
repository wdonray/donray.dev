"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

/**
 * Live view count for a page, fetched client-side from /api/views.
 * Renders nothing until the count loads (or if tracking is unconfigured).
 */
export default function ViewCount({ path }: { path: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/views?path=${encodeURIComponent(path)}`)
      .then((res) => res.json())
      .then((data: { views: number | null }) => {
        if (!cancelled && typeof data.views === "number" && data.views > 0) {
          setViews(data.views);
        }
      })
      .catch(() => {
        // Views are decorative; never break the page.
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (views === null) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden="true">·</span>
      <Eye className="size-3.5" aria-hidden="true" />
      {views} {views === 1 ? "view" : "views"}
    </span>
  );
}
