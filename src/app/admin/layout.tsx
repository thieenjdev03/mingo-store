import type { Metadata } from 'next';
import { ToastProvider } from '@/components/admin/ui/toast';
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
