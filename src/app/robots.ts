import type { MetadataRoute } from 'next';
import { absoluteUrl, IS_PRODUCTION_HOST } from '@/lib/seo';

/** Route riêng tư: đã có meta noindex, chặn thêm ở robots cho cả hai locale. */
const PRIVATE_PATHS = ['/cart', '/checkout', '/account', '/orders', '/login', '/register', '/forgot-password'];

export default function robots(): MetadataRoute.Robots {
  // Preview/alias (NEXT_PUBLIC_SITE_URL khác domain thương hiệu) không được index,
  // nếu không Google sẽ thấy hai bản sao của cùng nội dung.
  if (!IS_PRODUCTION_HOST) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', ...PRIVATE_PATHS, ...PRIVATE_PATHS.map((path) => `/en${path}`)],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
