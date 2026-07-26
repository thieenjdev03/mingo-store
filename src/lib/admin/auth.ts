/**
 * Phiên đăng nhập admin — tách khỏi auth storefront (chưa hoàn thiện).
 * Access token dùng chung key với customFetch (lib/auth/token.ts) để request tự đính kèm Bearer.
 * Thông tin user (role) lưu riêng để guard `/admin/**`.
 */
import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth/token';

const ADMIN_USER_KEY = 'mingo-admin-user';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function saveAdminSession(token: string, user: AdminUser): void {
  setAccessToken(token);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ADMIN_USER_KEY);
  }
}

/** Có token + role admin. Guard client-side dựa vào đây (backend vẫn là nguồn chân lý qua 401/403). */
export function isAdminAuthenticated(): boolean {
  return !!getAccessToken() && getAdminUser()?.role === 'admin';
}
