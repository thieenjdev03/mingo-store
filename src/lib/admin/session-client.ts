const SESSION_URL = '/api/admin/session';

export interface AuthSessionUser {
  id: string;
  email: string;
  role: string;
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
