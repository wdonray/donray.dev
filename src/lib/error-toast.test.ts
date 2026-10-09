import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dismissToast,
  getErrorMessage,
  subscribeToToasts,
  toastError,
  type ErrorToast,
} from "./error-toast";

function collectToasts() {
  let toasts: ErrorToast[] = [];
  const unsubscribe = subscribeToToasts((next) => {
    toasts = next;
  });
  return {
    getToasts: () => toasts,
    unsubscribe,
  };
}

beforeEach(() => {
  // Drain any toasts left by a previous test.
  const collector = collectToasts();
  for (const toast of collector.getToasts()) dismissToast(toast.id);
  collector.unsubscribe();
});

describe("getErrorMessage", () => {
  it("maps fetch TypeErrors to the network message", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Couldn't reach the server. Check your connection and try again.",
    );
  });

  it("maps Response statuses to the approved copy", () => {
    expect(getErrorMessage(new Response(null, { status: 400 }))).toBe(
      "That didn't work. Please try again.",
    );
    expect(getErrorMessage(new Response(null, { status: 401 }))).toBe(
      "Your session expired. Please sign in again.",
    );
    expect(getErrorMessage(new Response(null, { status: 403 }))).toBe(
      "You don't have permission to do that.",
    );
    expect(getErrorMessage(new Response(null, { status: 404 }))).toBe(
      "That wasn't found. It may have been moved or deleted.",
    );
    expect(getErrorMessage(new Response(null, { status: 409 }))).toBe(
      "That already exists.",
    );
    expect(getErrorMessage(new Response(null, { status: 429 }))).toBe(
      "Too many requests. Please wait a moment and try again.",
    );
  });

  it("maps 5xx statuses to the server message", () => {
    for (const status of [500, 502, 503, 599]) {
      expect(getErrorMessage(new Response(null, { status }))).toBe(
        "Something went wrong on our end. We're looking into it.",
      );
    }
  });

  it("reads status from plain error-like objects", () => {
    expect(getErrorMessage({ status: 404 })).toBe(
      "That wasn't found. It may have been moved or deleted.",
    );
    expect(getErrorMessage({ status: 503 })).toBe(
      "Something went wrong on our end. We're looking into it.",
    );
  });

  it("falls back to the generic message for unknown statuses and values", () => {
    const generic = "Something went wrong. Please try again.";
    expect(getErrorMessage(new Response(null, { status: 302 }))).toBe(generic);
    expect(getErrorMessage({ status: "404" })).toBe(generic);
    expect(getErrorMessage({ status: 404.5 })).toBe(generic);
    expect(getErrorMessage(new Error("boom"))).toBe(generic);
    expect(getErrorMessage("boom")).toBe(generic);
    expect(getErrorMessage(null)).toBe(generic);
    expect(getErrorMessage(undefined)).toBe(generic);
  });
});

describe("toast store", () => {
  it("notifies subscribers of new toasts, newest on top", () => {
    const collector = collectToasts();
    const listener = vi.fn();
    const stop = subscribeToToasts(listener);

    toastError("first");
    toastError("second");

    expect(collector.getToasts().map((t) => t.message)).toEqual([
      "second",
      "first",
    ]);
    expect(listener).toHaveBeenCalledTimes(3); // initial + 2 toasts
    stop();
    collector.unsubscribe();
  });

  it("caps visible toasts at 3, evicting the oldest", () => {
    const collector = collectToasts();
    for (let i = 1; i <= 4; i++) toastError(`toast ${i}`);
    expect(collector.getToasts().map((t) => t.message)).toEqual([
      "toast 4",
      "toast 3",
      "toast 2",
    ]);
    collector.unsubscribe();
  });

  it("dismissToast removes the toast and ignores unknown ids", () => {
    const collector = collectToasts();
    const id = toastError("bye");
    dismissToast(999_999);
    expect(collector.getToasts()).toHaveLength(1);
    dismissToast(id);
    expect(collector.getToasts()).toHaveLength(0);
    collector.unsubscribe();
  });

  it("returns unique ids", () => {
    const collector = collectToasts();
    const a = toastError("a");
    const b = toastError("b");
    expect(a).not.toBe(b);
    dismissToast(a);
    dismissToast(b);
    collector.unsubscribe();
  });
});
