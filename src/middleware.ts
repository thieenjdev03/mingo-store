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

/**
 * Nonce-based CSP: script-src has no 'unsafe-inline', so an XSS payload that
 * slips past backend HTML sanitization (rich-text product/policy/career
 * content rendered via dangerouslySetInnerHTML) still can't execute a
 * <script> or inline event handler. style-src keeps 'unsafe-inline' because
 * the app relies on style={{}} attributes throughout, which CSP nonces can't
 * cover.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' https: data:`,
    `font-src 'self' data:`,
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    `media-src 'self' https:`,
    `frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ');
}

function withCsp(response: NextResponse, csp: string): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);
  // Forwarded so Server Components (JsonLd, layouts) can nonce their own
  // inline <script>/<style> tags; see next-intl's CSP recipe for this pattern.
  request.headers.set('x-nonce', nonce);
  request.headers.set('Content-Security-Policy', csp);

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (!isAdminRoute) {
    const isAuthRoute = /^\/(?:vi\/|en\/)?(?:login|register|forgot-password)$/.test(pathname);
    if (!isAuthRoute) return withCsp(intlMiddleware(request), csp);

    const accessToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
    const adminSession = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
    const role = accessToken ? await getSessionRole(accessToken) : null;
    if (role === 'admin' || adminSession) return withCsp(NextResponse.redirect(new URL('/admin', request.url)), csp);
    if (role === 'user') return withCsp(NextResponse.redirect(new URL(homePath(pathname), request.url)), csp);

    const response = intlMiddleware(request);
    if (accessToken) clearCookie(response, AUTH_SESSION_COOKIE);
    if (request.cookies.has(ADMIN_SESSION_COOKIE)) clearCookie(response, ADMIN_SESSION_COOKIE);
    return withCsp(response, csp);
  }

  const isLoginRoute = pathname === '/admin/login';
  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE);
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (isLoginRoute) {
    if (session) return withCsp(secureAdminResponse(NextResponse.redirect(new URL('/admin', request.url))), csp);
    if (!hasSessionCookie) return withCsp(secureAdminResponse(NextResponse.next()), csp);
    const response = secureAdminResponse(NextResponse.next());
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return withCsp(response, csp);
  }

  if (session) return withCsp(secureAdminResponse(NextResponse.next()), csp);

  const response = secureAdminResponse(NextResponse.redirect(new URL('/admin/login', request.url)));
  if (hasSessionCookie) response.cookies.delete(ADMIN_SESSION_COOKIE);
  return withCsp(response, csp);
}

export const config = {
  // Bảo vệ admin trước khi render; các route còn lại đi qua next-intl.
  matcher: ['/admin/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
