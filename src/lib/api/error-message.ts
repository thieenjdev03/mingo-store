import { ApiError } from './fetcher';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;

  const body = error.body as
    | { message?: string | string[]; error?: string }
    | null;
  const message = body?.message ?? body?.error;

  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}
