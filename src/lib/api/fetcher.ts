/**
 * Fetch wrapper dùng làm mutator cho orval (xem orval.config.ts).
 * Mọi request đi qua đây: gắn base URL, JSON, và (sau này) JWT + refresh.
 * TODO(auth): port logic refresh-token interceptor từ repo cũ (src/auth/context/jwt).
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface FetchConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
  const { url, method, params, data, headers, signal } = config;

  const res = await fetch(buildUrl(url, params), {
    method,
    signal,
    headers: {
      ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
      // TODO(auth): Authorization: `Bearer ${getAccessToken()}`
      ...headers,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
