/**
 * Unified error-toast API: user-facing error messages shown as
 * bottom-center toasts. This is the presentation layer only; every error
 * is still reported to Sentry via report-error.ts. Only errors the user
 * needs to know about get a toast.
 */

export type ErrorToast = {
  id: number;
  message: string;
};

type ToastListener = (toasts: ErrorToast[]) => void;

const MAX_TOASTS = 3;

let toasts: ErrorToast[] = [];
let nextId = 1;
const listeners = new Set<ToastListener>();

function emit(): void {
  const snapshot = [...toasts];
  for (const listener of listeners) listener(snapshot);
}

export function subscribeToToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

/** Show an error toast. Newest appears on top; at most 3 are visible. */
export function toastError(message: string): number {
  const id = nextId++;
  toasts = [{ id, message }, ...toasts].slice(0, MAX_TOASTS);
  emit();
  return id;
}

export function dismissToast(id: number): void {
  if (!toasts.some((toast) => toast.id === id)) return;
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

/**
 * Map an error to the user-facing message for the toast. Status-code
 * specific but generic: the user cannot take corrective action, so the
 * copy names the failure without jargon or raw status codes.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  const status = getHttpStatus(error);
  switch (status) {
    case 400:
      return "That didn't work. Please try again.";
    case 401:
      return "Your session expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "That wasn't found. It may have been moved or deleted.";
    case 409:
      return "That already exists.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      break;
  }
  if (status !== undefined && status >= 500 && status <= 599) {
    return "Something went wrong on our end. We're looking into it.";
  }
  return "Something went wrong. Please try again.";
}

function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof Response) return error.status;
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number" && Number.isInteger(status)) return status;
  }
  return undefined;
}
