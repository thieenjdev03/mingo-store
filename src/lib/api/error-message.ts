import { ApiError } from './fetcher';

type ApiErrorBody = {
  message?: string | string[];
  /** Nest validation response chi tiết, ví dụ lỗi của từng field. */
  errors?: string | string[];
  error?: string;
};

function toMessages(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter((message) => message.trim() !== '');
  return value?.trim() ? [value] : [];
}

/**
 * Ưu tiên `errors[]` của backend để không thay thế lỗi validation cụ thể bằng
 * thông báo chung như "Validation failed".
 */
export function getApiErrorMessages(error: unknown, fallback: string): string[] {
  if (!(error instanceof ApiError)) return [fallback];

  const body = error.body as ApiErrorBody | null;
  const validationMessages = toMessages(body?.errors);
  if (validationMessages.length > 0) return validationMessages;

  const messages = toMessages(body?.message ?? body?.error);
  return messages.length > 0 ? messages : [fallback];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessages(error, fallback).join(', ');
}
