const SESSION_URL = '/api/admin/session';

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

/** Admin credentials go only to the same-origin BFF; the JWT never reaches browser JavaScript. */
export async function loginAdminSession(credentials: { email: string; password: string }): Promise<AuthSessionUser> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    cache: 'no-store',
  });
  if (!response.ok) throw new AdminSessionError(response.status);
  const body = (await response.json()) as { user?: AuthSessionUser };
  if (!body.user || body.user.role !== 'admin') throw new AdminSessionError(403);
  return body.user;
}

export async function syncAdminSession(accessToken: string): Promise<AuthSessionUser | null> {
  try {
    const response = await fetch(SESSION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { user?: AuthSessionUser };
    return body.user ?? null;
  } catch {
    return null;
  }
}

export async function clearAdminSessionCookie(): Promise<void> {
  await fetch(SESSION_URL, { method: 'DELETE', keepalive: true }).catch(() => undefined);
}
