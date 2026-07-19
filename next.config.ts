import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Ảnh sản phẩm đang lưu trên Cloudinary (backend giữ nguyên URL tuyệt đối)
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  // Scaffold chưa kèm ESLint config — bật lại khi team chốt rule (npm run lint vẫn dùng được sau khi thêm eslint-config-next)
  eslint: { ignoreDuringBuilds: true },
};

export default withNextIntl(nextConfig);
