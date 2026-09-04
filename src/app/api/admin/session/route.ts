import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'mingo-admin-session';
const AUTH_SESSION_COOKIE = 'mingo-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

interface SessionUser {
  id: string;
  email: string;
  role: string;
}

function setCookie(response: NextResponse, name: string, value: string, maxAge: number): NextResponse {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return response;
}

function clearCookie(response: NextResponse, name: string): NextResponse {
  return setCookie(response, name, '', 0);
}

function clearAuthCookies(response: NextResponse): NextResponse {
  clearCookie(response, AUTH_SESSION_COOKIE);
  return clearCookie(response, ADMIN_SESSION_COOKIE);
}

async function getUser(accessToken: string): Promise<SessionUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: SessionUser } | SessionUser;
    const user = 'data' in payload ? payload.data : payload;
    const candidate = user as SessionUser | undefined;
    return candidate?.id && candidate.email && candidate.role ? candidate : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { accessToken?: unknown } | null;
  const accessToken = typeof body?.accessToken === 'string' ? body.accessToken : '';
  const user = accessToken ? await getUser(accessToken) : null;

  if (!user) {
    return clearAuthCookies(NextResponse.json({ message: 'Invalid session' }, { status: 401 }));
  }

  const response = NextResponse.json({ user });
  setCookie(response, AUTH_SESSION_COOKIE, accessToken, SESSION_MAX_AGE);
  if (user.role !== 'admin') return clearCookie(response, ADMIN_SESSION_COOKIE);

  setCookie(response, ADMIN_SESSION_COOKIE, accessToken, SESSION_MAX_AGE);
  return response;
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const user = accessToken ? await getUser(accessToken) : null;
  if (!user || user.role !== 'admin') {
    return clearCookie(NextResponse.json({ message: 'Admin session required' }, { status: 401 }), ADMIN_SESSION_COOKIE);
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  return clearAuthCookies(NextResponse.json({ success: true }));
}
