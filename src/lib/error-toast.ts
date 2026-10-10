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
 * Message keys for the `errorToast` message namespace. Status-code
 * specific but generic: the user cannot take corrective action, so the
 * copy names the failure without jargon or raw status codes. Callers
 * translate the key with the active locale's messages.
 */
export type ErrorMessageKey =
  | "networkError"
  | "badRequest"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "rateLimited"
  | "serverError"
  | "unknownError";

export function getErrorMessageKey(error: unknown): ErrorMessageKey {
  if (error instanceof TypeError) {
    return "networkError";
  }
  const status = getHttpStatus(error);
  switch (status) {
    case 400:
      return "badRequest";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 409:
      return "conflict";
    case 429:
      return "rateLimited";
    default:
      break;
  }
  if (status !== undefined && status >= 500 && status <= 599) {
    return "serverError";
  }
  return "unknownError";
}

function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof Response) return error.status;
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number" && Number.isInteger(status)) return status;
  }
  return undefined;
}
