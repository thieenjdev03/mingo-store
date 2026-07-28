/**
 * Fetch wrapper dùng làm mutator cho orval (xem orval.config.ts).
 * Mọi request đi qua đây: gắn base URL, JSON, và JWT bearer token (nếu có).
 * TODO(auth): port logic refresh-token interceptor từ repo cũ (src/auth/context/jwt).
 */
import { getAccessToken } from '@/lib/auth/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface FetchConfig {
  url: string;
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
  }
}

function buildUrl(url: string, params?: Record<string, unknown>): string {
  const full = new URL(url, BASE_URL || 'http://localhost');
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) full.searchParams.set(k, String(v));
    }
  }
  return BASE_URL ? full.toString() : `${full.pathname}${full.search}`;
}

export async function customFetch<T>(config: FetchConfig): Promise<T> {
  const { url, method, params, data, headers, signal, cache } = config;

  const token = getAccessToken();
  // FormData (file uploads) must be sent as-is — JSON.stringify would collapse
  // it to "{}", and setting Content-Type ourselves drops the multipart boundary.
  const isFormData = data instanceof FormData;

  const mergedHeaders: Record<string, string> = {
    ...(data !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  if (isFormData) delete mergedHeaders['Content-Type'];

  const res = await fetch(buildUrl(url, params), {
    method,
    signal,
    cache,
    headers: mergedHeaders,
    body: isFormData ? (data as FormData) : data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json();
  // Backend TransformInterceptor bọc mọi response thành { success, data } —
  // OpenAPI/generated types mô tả payload trần, nên unwrap tại đây (1 chỗ duy nhất).
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}
