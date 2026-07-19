import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  // vi (mặc định) không có prefix: /san-pham ; en: /en/san-pham
  localePrefix: 'as-needed',
});
