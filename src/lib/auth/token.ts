/**
 * Lưu access token ở localStorage (chưa có refresh-token flow — xem TODO(auth) ở fetcher.ts).
 * Guard bằng `typeof window` vì file này được import cả từ customFetch (chạy trên server lẫn client).
 */
const TOKEN_KEY = 'mingo-access-token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    // Một số môi trường trình duyệt có thể chặn localStorage (privacy mode/webview).
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Guard sẽ đưa người dùng về login nếu phiên không thể được lưu.
  }
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Không chặn luồng logout nếu storage không khả dụng.
  }
}
