import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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
  // Browser gọi thẳng backend (không qua BFF proxy nữa), nên connect-src phải mở cho origin đó.
  const backendOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' https: data:`,
    `font-src 'self' data:`,
    `connect-src 'self'${backendOrigin ? ` ${backendOrigin}` : ''}${isDev ? ' ws:' : ''}`,
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

  // /admin không qua next-intl (không localized). Quyền truy cập được kiểm tra hoàn toàn
  // phía client bởi AdminGuard (token JWT nằm trong localStorage, middleware không đọc được).
  if (isAdminRoute) return withCsp(NextResponse.next(), csp);

  return withCsp(intlMiddleware(request), csp);
}

export const config = {
  // /admin chỉ cần CSP (không qua next-intl); các route còn lại đi qua next-intl.
  matcher: ['/admin/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
