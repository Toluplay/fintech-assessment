import type { ApiErrorBody, ApiErrorKind } from '@/types/api';

/**
 * The single error type the UI ever sees. It carries a status, a machine
 * readable `kind` and a message that is already safe to show to a customer.
 * Raw transport errors ("AxiosError: Request failed...") never leave the
 * services layer.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kindFromStatus(status);
    this.details = details;
  }

  static network(): ApiError {
    return new ApiError(0, USER_MESSAGES.network);
  }

  static fromResponse(status: number, body: Partial<ApiErrorBody> | null): ApiError {
    const kind = kindFromStatus(status);
    // Only 4xx validation/business messages written by our own API are shown
    // verbatim; everything else gets a generic, non-technical message.
    const canEchoServerMessage = kind === 'bad_request' || kind === 'unauthorized';
    const message =
      canEchoServerMessage && body?.message && body.message !== 'Validation failed'
        ? body.message
        : USER_MESSAGES[kind];
    return new ApiError(status, message, body?.details ?? []);
  }
}

export const USER_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'You appear to be offline. Check your connection and try again.',
  bad_request: 'Some of the information provided is invalid. Please check and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to do that.',
  not_found: 'We could not find what you were looking for.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  server: 'Something went wrong on our side. Please try again.',
  unknown: 'Something unexpected happened. Please try again.',
};

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 0) return 'network';
  if (status === 400 || status === 422) return 'bad_request';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Turns any thrown value into copy that is safe to render. */
export function getUserMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  return USER_MESSAGES.unknown;
}
