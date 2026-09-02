import { NextRequest, NextResponse } from 'next/server';
import type { LoginResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
} from '@/lib/admin/server-session';
import { buildServerApiUrl } from '@/lib/api/server-url';
import { isSameOriginMutation } from '@/lib/api/proxy-security';

interface LoginEnvelope {
  data?: LoginResponseDto;
  success?: boolean;
}

function noStoreJson(body: unknown, status = 200): NextResponse {
  const response = NextResponse.json(body, { status });
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return noStoreJson({ message: 'Cross-origin request blocked' }, 403);
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || email.length > 254 || !password || password.length > 256) {
    return noStoreJson({ message: 'Invalid credentials' }, 400);
  }

  const loginUrl = buildServerApiUrl('auth/login');
  if (!loginUrl) return noStoreJson({ message: 'Authentication service is not configured' }, 503);

  let upstream: Response;
  try {
    upstream = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: request.signal,
    });
  } catch {
    return noStoreJson({ message: 'Authentication service is unavailable' }, 502);
  }

  const rawPayload = (await upstream.json().catch(() => null)) as LoginEnvelope | LoginResponseDto | null;
  if (!upstream.ok || !rawPayload) {
    return noStoreJson({ message: upstream.status === 401 ? 'Invalid credentials' : 'Login failed' }, upstream.status);
  }
  const payload =
    typeof rawPayload === 'object' && rawPayload && 'data' in rawPayload && rawPayload.data
      ? rawPayload.data
      : rawPayload as LoginResponseDto;
  if (!payload.accessToken || !payload.user || payload.user.role !== 'admin') {
    return noStoreJson({ message: 'Admin role required' }, 403);
  }

  const sealedSession = await createAdminSession(payload.accessToken, payload.user);
  if (!sealedSession) {
    return noStoreJson({ message: 'Admin session security is not configured' }, 503);
  }

  const response = noStoreJson({ user: payload.user });
  response.cookies.set(ADMIN_SESSION_COOKIE, sealedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
