import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Bỏ qua api routes, static files, _next, và khu admin (/admin có root layout riêng, non-localized)
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
