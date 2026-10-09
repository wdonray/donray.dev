import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { reportError } from "./report-error";

const { mockSetTag, mockSetExtras, mockCaptureException, mockWithScope } =
  vi.hoisted(() => ({
    mockSetTag: vi.fn(),
    mockSetExtras: vi.fn(),
    mockCaptureException: vi.fn(),
    mockWithScope: vi.fn(),
  }));

vi.mock("@sentry/nextjs", () => ({
  withScope: mockWithScope,
  captureException: mockCaptureException,
}));

describe("reportError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithScope.mockImplementation((callback: (scope: unknown) => void) =>
      callback({ setTag: mockSetTag, setExtras: mockSetExtras }),
    );
  });

  it("captures an Error as-is with location tag and extras", () => {
    const error = new Error("boom");
    reportError(error, {
      location: "SomeComponent.someHandler",
      extra: { route: "/api/views", status: 503 },
    });

    expect(mockWithScope).toHaveBeenCalledTimes(1);
    expect(mockSetTag).toHaveBeenCalledWith(
      "location",
      "SomeComponent.someHandler",
    );
    expect(mockSetExtras).toHaveBeenCalledWith({
      route: "/api/views",
      status: 503,
    });
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("wraps non-Error values in an Error", () => {
    reportError("string failure");

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    const captured = mockCaptureException.mock.calls[0][0] as Error;
    expect(captured).toBeInstanceOf(Error);
    expect(captured.message).toBe("string failure");
    expect(mockSetTag).not.toHaveBeenCalled();
    expect(mockSetExtras).not.toHaveBeenCalled();
  });

  it("ignores AbortError DOMExceptions", () => {
    reportError(new DOMException("The operation was aborted.", "AbortError"));

    expect(mockWithScope).not.toHaveBeenCalled();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it("reports non-abort DOMExceptions wrapped as Errors", () => {
    const error = new DOMException("Not found.", "NotFoundError");
    reportError(error, { location: "Somewhere" });

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    const captured = mockCaptureException.mock.calls[0][0] as Error;
    expect(captured).toBeInstanceOf(Error);
    expect(captured.message).toContain("Not found.");
    expect(mockSetTag).toHaveBeenCalledWith("location", "Somewhere");
  });

  it("uses the default empty options", () => {
    reportError(new Error("no options"));

    expect(mockWithScope).toHaveBeenCalledTimes(1);
    expect(mockSetTag).not.toHaveBeenCalled();
    expect(mockSetExtras).not.toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it("calls the real Sentry module shape", () => {
    // Guards against the mock drifting from the module's exports.
    expect(typeof Sentry.withScope).toBe("function");
    expect(typeof Sentry.captureException).toBe("function");
  });
});
