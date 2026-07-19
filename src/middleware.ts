import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Bỏ qua api routes, static files, _next
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
