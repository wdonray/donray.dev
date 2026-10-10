import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dismissToast,
  getErrorMessageKey,
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

describe("getErrorMessageKey", () => {
  it("maps fetch TypeErrors to the network key", () => {
    expect(getErrorMessageKey(new TypeError("Failed to fetch"))).toBe(
      "networkError",
    );
  });

  it("maps Response statuses to keys", () => {
    expect(getErrorMessageKey(new Response(null, { status: 400 }))).toBe(
      "badRequest",
    );
    expect(getErrorMessageKey(new Response(null, { status: 401 }))).toBe(
      "unauthorized",
    );
    expect(getErrorMessageKey(new Response(null, { status: 403 }))).toBe(
      "forbidden",
    );
    expect(getErrorMessageKey(new Response(null, { status: 404 }))).toBe(
      "notFound",
    );
    expect(getErrorMessageKey(new Response(null, { status: 409 }))).toBe(
      "conflict",
    );
    expect(getErrorMessageKey(new Response(null, { status: 429 }))).toBe(
      "rateLimited",
    );
  });

  it("maps 5xx statuses to the server key", () => {
    for (const status of [500, 502, 503, 599]) {
      expect(getErrorMessageKey(new Response(null, { status }))).toBe(
        "serverError",
      );
    }
  });

  it("reads status from plain error-like objects", () => {
    expect(getErrorMessageKey({ status: 404 })).toBe("notFound");
    expect(getErrorMessageKey({ status: 503 })).toBe("serverError");
  });

  it("falls back to the generic key for unknown statuses and values", () => {
    expect(getErrorMessageKey(new Response(null, { status: 302 }))).toBe(
      "unknownError",
    );
    expect(getErrorMessageKey({ status: "404" })).toBe("unknownError");
    expect(getErrorMessageKey({ status: 404.5 })).toBe("unknownError");
    expect(getErrorMessageKey(new Error("boom"))).toBe("unknownError");
    expect(getErrorMessageKey("boom")).toBe("unknownError");
    expect(getErrorMessageKey(null)).toBe("unknownError");
    expect(getErrorMessageKey(undefined)).toBe("unknownError");
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
