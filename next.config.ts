import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ảnh sản phẩm đang lưu trên Cloudinary (backend giữ nguyên URL tuyệt đối)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // QR chuyển khoản VietQR — ảnh render động theo amount/addInfo, xem src/config/vietqr.ts
      { protocol: 'https', hostname: 'img.vietqr.io' },
      // Ảnh packshot catalog Mingo (backend seed trỏ trực tiếp về site thương hiệu)
      { protocol: 'https', hostname: 'mingoicecream.com' },
    ],
  },
  // Scaffold chưa kèm ESLint config — bật lại khi team chốt rule (npm run lint vẫn dùng được sau khi thêm eslint-config-next)
  eslint: { ignoreDuringBuilds: true },
};

export default withNextIntl(nextConfig);
