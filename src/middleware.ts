import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const ADMIN_SESSION_COOKIE = 'mingo-admin-session';
const AUTH_SESSION_COOKIE = 'mingo-session';

async function getSessionRole(accessToken: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/me`, {
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (!isAdminRoute) {
    const isAuthRoute = /^\/(?:vi\/|en\/)?(?:login|register|forgot-password)$/.test(pathname);
    if (!isAuthRoute) return intlMiddleware(request);

    const accessToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const role = accessToken ? await getSessionRole(accessToken) : null;
    const adminRole = adminToken ? await getSessionRole(adminToken) : null;
    if (role === 'admin' || adminRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'user') return NextResponse.redirect(new URL(homePath(pathname), request.url));

    const response = intlMiddleware(request);
    if (accessToken) clearCookie(response, AUTH_SESSION_COOKIE);
    if (adminToken) clearCookie(response, ADMIN_SESSION_COOKIE);
    return response;
  }

  const isLoginRoute = pathname === '/admin/login';
  const accessToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = accessToken && (await getSessionRole(accessToken)) === 'admin';

  if (isLoginRoute) {
    if (valid) return NextResponse.redirect(new URL('/admin', request.url));
    if (!accessToken) return NextResponse.next();
    const response = NextResponse.next();
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  if (valid) return NextResponse.next();

  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  if (accessToken) response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

export const config = {
  // Bảo vệ admin trước khi render; các route còn lại đi qua next-intl.
  matcher: ['/admin/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
