import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/admin/server-session';
import { buildServerApiUrl } from '@/lib/api/server-url';
import { isSameOriginMutation } from '@/lib/api/proxy-security';

const AUTH_SESSION_COOKIE = 'mingo-session';
const MAX_BODY_BYTES = 10 * 1024 * 1024;

const ALLOWED_ROOTS = new Set([
  'admin',
  'addresses',
  'audit-logs',
  'auth',
  'brands',
  'careers',
  'cart',
  'categories',
  'checkout',
  'collections',
  'colors',
  'contact',
  'distributors',
  'files',
  'health',
  'homepage',
  'mail',
  'marketing',
  'me',
  'orders',
  'otp',
  'pay-pal',
  'policies',
  'products',
  'shipping',
  'settings',
  'site-settings',
  'sizes',
  'user-addresses',
  'user-phone',
  'user-points',
  'user-wishlist',
  'users',
]);

const ADMIN_ONLY_ROOTS = new Set(['admin', 'audit-logs', 'files', 'mail', 'users']);
const ADMIN_MUTATION_ROOTS = new Set([
  'brands',
  'categories',
  'collections',
  'colors',
  'homepage',
  'products',
  'settings',
  'site-settings',
  'sizes',
]);

const PUBLIC_CACHEABLE_ROOTS = new Set([
  'brands',
  'careers',
  'categories',
  'collections',
  'colors',
  'distributors',
  'health',
  'homepage',
  'policies',
  'products',
  'site-settings',
  'sizes',
]);

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

function safePath(segments: string[]): string | null {
  if (segments.length === 0 || !ALLOWED_ROOTS.has(segments[0] ?? '')) return null;
  if (segments.some((segment) => !segment || segment === '.' || segment === '..' || /[\\\0]/.test(segment))) {
    return null;
  }
  return segments.map(encodeURIComponent).join('/');
}

function copyRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  for (const name of ['accept', 'accept-language', 'content-type', 'if-none-match', 'x-cart-token']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function copyResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  for (const name of ['content-disposition', 'content-language', 'content-type', 'etag', 'last-modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  if (!isSameOriginMutation(request)) return jsonError('Cross-origin request blocked', 403);

  const { path: segments } = await context.params;
  const path = safePath(segments);
  if (!path) return jsonError('API path is not allowed', 404);
  const root = segments[0] ?? '';

  const upstreamUrl = buildServerApiUrl(path, request.nextUrl.search);
  if (!upstreamUrl) return jsonError('Backend API is not configured', 503);

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError('Request body is too large', 413);
  }

  const headers = copyRequestHeaders(request);
  const adminSession = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  const customerToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const clientAuthorization = request.headers.get('authorization');
  const accessToken = adminSession?.accessToken ?? customerToken;
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  else if (clientAuthorization?.startsWith('Bearer ')) headers.set('Authorization', clientAuthorization);

  const method = request.method.toUpperCase();
  const careerAdminOperation =
    root === 'careers' &&
    (
      ['PATCH', 'DELETE'].includes(method) ||
      (method === 'POST' && segments[2] !== 'apply') ||
      (method === 'GET' && segments[2] === 'applications')
    );
  const requiresAdmin =
    ADMIN_ONLY_ROOTS.has(root) ||
    (ADMIN_MUTATION_ROOTS.has(root) && !['GET', 'HEAD'].includes(method)) ||
    careerAdminOperation;
  if (requiresAdmin && !adminSession) return jsonError('Admin session required', 401);

  const hasBody = !['GET', 'HEAD'].includes(method);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: request.signal,
    });
  } catch {
    return jsonError('Backend API is unavailable', 502);
  }

  const responseHeaders = copyResponseHeaders(upstream);
  const hasPrivateContext = Boolean(
    adminSession ||
    customerToken ||
    clientAuthorization ||
    request.headers.get('x-cart-token'),
  );
  const cachePublicResponse =
    method === 'GET' &&
    upstream.ok &&
    !hasPrivateContext &&
    PUBLIC_CACHEABLE_ROOTS.has(root);

  responseHeaders.set(
    'Cache-Control',
    cachePublicResponse
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'private, no-store, max-age=0',
  );
  responseHeaders.set('Vary', 'Accept-Language, Authorization, Cookie, X-Cart-Token');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
