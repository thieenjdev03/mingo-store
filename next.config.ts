import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone', // build ra .next/standalone cho Docker
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  async headers() {
    const baselineSecurityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [
      {
        source: '/:path*',
        headers: baselineSecurityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: [
          ...baselineSecurityHeaders,
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      // Ảnh sản phẩm đang lưu trên Cloudinary (backend giữ nguyên URL tuyệt đối)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // QR chuyển khoản VietQR — ảnh render động theo amount/addInfo, xem src/config/vietqr.ts
      { protocol: 'https', hostname: 'img.vietqr.io' },
      // Ảnh packshot catalog Mingo (backend seed trỏ trực tiếp về site thương hiệu)
      { protocol: 'https', hostname: 'mingoicecream.com' },
      { protocol: 'https', hostname: 'top-virginia-05112023.s3.amazonaws.com' }
    ],
  },
  // Scaffold chưa kèm ESLint config — bật lại khi team chốt rule (npm run lint vẫn dùng được sau khi thêm eslint-config-next)
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // App có nhiều root layout (storefront [locale] + admin), không có root layout chung ở app/.
    // globalNotFound cho phép app/global-not-found.tsx tự render <html>/<body> làm 404 cho URL
    // không khớp bất kỳ segment nào — thay cho app/not-found.tsx (vốn cần một root layout phía trên).
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
