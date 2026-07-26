/**
 * Lưu access token ở localStorage (chưa có refresh-token flow — xem TODO(auth) ở fetcher.ts).
 * Guard bằng `typeof window` vì file này được import cả từ customFetch (chạy trên server lẫn client).
 */
const TOKEN_KEY = 'mingo-access-token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}
