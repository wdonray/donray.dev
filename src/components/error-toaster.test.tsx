import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorToaster from "./error-toaster";
import { dismissToast, toastError } from "@/lib/error-toast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function drainToasts() {
  // Toasts are module state; dismiss everything this test created.
  const alerts = screen.queryAllByRole("alert");
  for (const alert of alerts) {
    const button = alert.querySelector("button");
    if (button) fireEvent.click(button);
  }
}

describe("ErrorToaster", () => {
  it("renders nothing when there are no toasts", () => {
    const { container } = render(<ErrorToaster />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the error as an assertive alert", () => {
    render(<ErrorToaster />);
    act(() => {
      toastError("Something went wrong. Please try again.");
    });

    const toast = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dismiss notification" }),
    ).toBeInTheDocument();
    drainToasts();
  });

  it("auto-dismisses after 8 seconds", () => {
    const { container } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("pauses the timer while hovered and resumes after", () => {
    const { container } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    const toast = screen.getByRole("alert");

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Still visible: the timer was paused with 1s left.
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("pauses the timer while focused and resumes on blur", () => {
    const { container } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    const toast = screen.getByRole("alert");

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    fireEvent.focus(toast);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.blur(toast);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses via the close button", () => {
    const { container } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses the focused toast on Escape", () => {
    const { container } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    const toast = screen.getByRole("alert");
    fireEvent.keyDown(toast, { key: "Escape" });
    expect(container).toBeEmptyDOMElement();
  });

  it("caps visible toasts at 3, newest on top", () => {
    render(<ErrorToaster />);
    act(() => {
      toastError("one");
      toastError("two");
      toastError("three");
      toastError("four");
    });
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toHaveTextContent("four");
    drainToasts();
  });

  it("clears its timer on unmount without dismissing the toast", () => {
    const { unmount } = render(<ErrorToaster />);
    act(() => {
      toastError("boom");
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    // Re-mount: the toast is still in the store (timer was cleared).
    render(<ErrorToaster />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    drainToasts();
  });

  it("dismissToast from outside removes the toast", () => {
    const { container } = render(<ErrorToaster />);
    let id = 0;
    act(() => {
      id = toastError("boom");
    });
    act(() => {
      dismissToast(id);
    });
    expect(container).toBeEmptyDOMElement();
  });
});
