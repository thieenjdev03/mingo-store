import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import viMessages from '../../../messages/vi.json';
import { ToastProvider } from '@/components/admin/ui/toast';
import { ApiCacheProvider } from '@/components/providers/api-cache-provider';
import '@/styles/globals.css';

/**
 * Root layout RIÊNG cho khu admin (pattern multiple-root-layouts của Next App Router):
 * nhánh /admin tự có <html>/<body>, tách hoàn toàn khỏi layout storefront ([locale]/layout.tsx).
 * Non-localized — /admin được loại khỏi middleware next-intl (xem src/middleware.ts).
 */
export const metadata: Metadata = {
  title: 'Mingo Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          <ApiCacheProvider>
            <ToastProvider>{children}</ToastProvider>
          </ApiCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
