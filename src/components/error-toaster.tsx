"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, X } from "lucide-react";
import {
  dismissToast,
  subscribeToToasts,
  type ErrorToast,
} from "@/lib/error-toast";

const AUTO_DISMISS_MS = 8000;

function ToastCard({ toast }: { toast: ErrorToast }) {
  // Mutable timer controls, stable across renders. pause/resume read the ref
  // only when invoked (event handlers), never during render.
  const controlsRef = useRef({
    remaining: AUTO_DISMISS_MS,
    startedAt: 0,
    timer: null as ReturnType<typeof setTimeout> | null,
  });

  useEffect(() => {
    const controls = controlsRef.current;
    controls.remaining = AUTO_DISMISS_MS;
    controls.startedAt = Date.now();
    controls.timer = setTimeout(
      () => dismissToast(toast.id),
      controls.remaining,
    );
    return () => {
      if (controls.timer) clearTimeout(controls.timer);
    };
  }, [toast.id]);

  const pause = () => {
    const controls = controlsRef.current;
    if (controls.timer) {
      clearTimeout(controls.timer);
      controls.timer = null;
      controls.remaining = Math.max(
        0,
        controls.remaining - (Date.now() - controls.startedAt),
      );
    }
  };

  const resume = () => {
    const controls = controlsRef.current;
    if (controls.timer) clearTimeout(controls.timer);
    controls.startedAt = Date.now();
    controls.timer = setTimeout(
      () => dismissToast(toast.id),
      controls.remaining,
    );
  };

  return (
    <div
      role="alert"
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={(event) => {
        if (event.key === "Escape") dismissToast(toast.id);
      }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border-l-4 border-l-red-500 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 shadow-xl motion-reduce:transition-none"
    >
      <CircleAlert
        className="mt-0.5 size-5 shrink-0 text-red-400"
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(toast.id)}
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-50"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Global error toasts. Mounted once in ClientLayout so any part of the
 * app can surface a user-facing error via toastError(). Bottom-center,
 * above the safe-area inset; at most 3 visible, newest on top.
 */
export default function ErrorToaster() {
  const [toasts, setToasts] = useState<ErrorToast[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-[420px] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
