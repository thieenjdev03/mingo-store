import type { Metadata } from 'next';
import { Montserrat, Be_Vietnam_Pro } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/features/cart/cart-context';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '@/styles/globals.css';

// Font theo DESIGN.md: Montserrat cho display (chunky headline),
// Be Vietnam Pro cho body/label (subset 'vietnamese' đầy đủ dấu tiếng Việt).
const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Weights phải phủ hết các class font-* đang dùng (font-medium 500, font-bold 700).
// Thiếu weight -> trình duyệt tổng hợp giả bold từ weight gần nhất, metrics khác
// với font fallback lúc swap => chữ nhảy (rõ nhất ở footer).
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Mingo — Joy in every bite!', template: '%s | Mingo' },
  description: 'Kem Mingo — kem que, kem hộp, kem ốc quế. Joy in every bite!',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${montserrat.variable} ${beVietnamPro.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
