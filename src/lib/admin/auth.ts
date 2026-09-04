/** Token localStorage chỉ giữ tương thích với API client; quyền route nằm ở session HttpOnly. */
import { setAccessToken, clearAccessToken } from '@/lib/auth/token';

const ADMIN_USER_KEY = 'mingo-admin-user';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function saveAdminSession(token: string, user: AdminUser): void {
  setAccessToken(token);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } catch {
      // AdminGuard sẽ báo phiên chưa hợp lệ thay vì bị treo ở trạng thái checking.
    }
  }
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(ADMIN_USER_KEY);
    } catch {
      // Không chặn logout nếu storage không khả dụng.
    }
  }
}
