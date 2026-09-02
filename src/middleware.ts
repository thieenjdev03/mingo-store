import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './lib/admin/server-session';
import { buildServerApiUrl } from './lib/api/server-url';

const intlMiddleware = createMiddleware(routing);
const AUTH_SESSION_COOKIE = 'mingo-session';

async function getSessionRole(accessToken: string): Promise<string | null> {
  const meUrl = buildServerApiUrl('me');
  if (!meUrl) return null;

  try {
    const response = await fetch(meUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: { role?: string } } | { role?: string };
    const user = 'data' in payload ? payload.data : payload;
    return (user as { role?: string } | undefined)?.role ?? null;
  } catch {
    return null;
  }
}

function homePath(pathname: string): string {
  if (pathname === '/en' || pathname.startsWith('/en/')) return '/en';
  if (pathname === '/vi' || pathname.startsWith('/vi/')) return '/vi';
  return '/';
}

function clearCookie(response: NextResponse, name: string): NextResponse {
  response.cookies.delete(name);
  return response;
}

function secureAdminResponse(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (!isAdminRoute) {
    const isAuthRoute = /^\/(?:vi\/|en\/)?(?:login|register|forgot-password)$/.test(pathname);
    if (!isAuthRoute) return intlMiddleware(request);

    const accessToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const adminSession = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
    const role = accessToken ? await getSessionRole(accessToken) : null;
    if (role === 'admin' || adminSession) return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'user') return NextResponse.redirect(new URL(homePath(pathname), request.url));

    const response = intlMiddleware(request);
    if (accessToken) clearCookie(response, AUTH_SESSION_COOKIE);
    if (request.cookies.has(ADMIN_SESSION_COOKIE)) clearCookie(response, ADMIN_SESSION_COOKIE);
    return response;
  }

  const isLoginRoute = pathname === '/admin/login';
  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE);
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (isLoginRoute) {
    if (session) return secureAdminResponse(NextResponse.redirect(new URL('/admin', request.url)));
    if (!hasSessionCookie) return secureAdminResponse(NextResponse.next());
    const response = secureAdminResponse(NextResponse.next());
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  if (session) return secureAdminResponse(NextResponse.next());

  const response = secureAdminResponse(NextResponse.redirect(new URL('/admin/login', request.url)));
  if (hasSessionCookie) response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

export const config = {
  // Bảo vệ admin trước khi render; các route còn lại đi qua next-intl.
  matcher: ['/admin/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
