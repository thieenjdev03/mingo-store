import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  verifyAdminSession,
} from '@/lib/admin/server-session';
import { buildServerApiUrl } from '@/lib/api/server-url';
import { isSameOriginMutation } from '@/lib/api/proxy-security';

const AUTH_SESSION_COOKIE = 'mingo-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

interface SessionUser {
  id: string;
  /** Null for customers who arrived through guest checkout: they are keyed by phone
   *  and may never have supplied an email (see AuthService.setPassword). */
  email: string | null;
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
  const meUrl = buildServerApiUrl('me');
  if (!meUrl) return null;

  try {
    const response = await fetch(meUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: SessionUser } | SessionUser;
    const user = 'data' in payload ? payload.data : payload;
    const candidate = user as SessionUser | undefined;
    // Email is deliberately NOT required: a claimed guest account has none, and
    // rejecting it here would 401 the customer straight after a successful login.
    return candidate?.id && candidate.role ? candidate : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: 'Cross-origin request blocked' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { accessToken?: unknown } | null;
  const accessToken = typeof body?.accessToken === 'string' ? body.accessToken : '';
  const user = accessToken ? await getUser(accessToken) : null;

  if (!user) {
    return clearAuthCookies(NextResponse.json({ message: 'Invalid session' }, { status: 401 }));
  }

  const response = NextResponse.json({ user });
  setCookie(response, AUTH_SESSION_COOKIE, accessToken, SESSION_MAX_AGE);
  // Only admins get the signed admin-session cookie; they always carry an email,
  // unlike claimed guest accounts which are keyed by phone alone.
  if (user.role !== 'admin' || !user.email) return clearCookie(response, ADMIN_SESSION_COOKIE);

  const sealedSession = await createAdminSession(accessToken, { ...user, email: user.email });
  if (!sealedSession) {
    return clearAuthCookies(NextResponse.json({ message: 'Admin session security is not configured' }, { status: 503 }));
  }
  response.cookies.set(ADMIN_SESSION_COOKIE, sealedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) {
    return clearCookie(NextResponse.json({ message: 'Admin session required' }, { status: 401 }), ADMIN_SESSION_COOKIE);
  }
  // One revocation/role check per hard admin load. Middleware navigation remains
  // local-only, while a disabled or demoted account cannot keep using the shell.
  const currentUser = await getUser(session.accessToken);
  if (!currentUser || currentUser.role !== 'admin' || currentUser.id !== session.user.id) {
    return clearCookie(NextResponse.json({ message: 'Admin session expired' }, { status: 401 }), ADMIN_SESSION_COOKIE);
  }
  const response = NextResponse.json({ user: currentUser });
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: 'Cross-origin request blocked' }, { status: 403 });
  }
  return clearAuthCookies(NextResponse.json({ success: true }));
}
