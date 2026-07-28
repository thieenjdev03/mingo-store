import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  // vi (mặc định) không có prefix: /products ; en: /en/products
  localePrefix: 'as-needed',
  // Luôn mở tiếng Việt, không đoán theo Accept-Language của trình duyệt.
  localeDetection: false,
});
