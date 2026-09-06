import { authControllerLogin } from '@/lib/api/generated/auth/auth';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { setAccessToken } from '@/lib/auth/token';
import { ApiError } from '@/lib/api/fetcher';

export interface AuthSessionUser {
  id: string;
  email: string;
  role: string;
}

export class AdminSessionError extends Error {
  constructor(public status: number) {
    super(`Admin session ${status}`);
  }
}

/** Đăng nhập thẳng vào backend; JWT được lưu localStorage (xem src/lib/auth/token.ts). */
export async function loginAdminSession(credentials: { email: string; password: string }): Promise<AuthSessionUser> {
  let accessToken: string;
  let user: AuthSessionUser;
  try {
    const res = await authControllerLogin(credentials);
    accessToken = res.accessToken;
    user = res.user;
  } catch (err) {
    throw new AdminSessionError(err instanceof ApiError ? err.status : 500);
  }
  if (!user || user.role !== 'admin') throw new AdminSessionError(403);
  setAccessToken(accessToken);
  return user;
}

/** Xác thực token hiện có trong localStorage bằng cách hỏi lại backend `/me`. */
export async function fetchCurrentUser(): Promise<AuthSessionUser | null> {
  try {
    return await meControllerGetMe();
  } catch {
    return null;
  }
}
