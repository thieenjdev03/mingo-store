import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/features/cart/cart-context';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '@/styles/globals.css';

/*
 * TODO(font): khi chốt font brand ở Figma, bật next/font:
 *
 * import { Baloo_2, Be_Vietnam_Pro } from 'next/font/google';
 * const display = Baloo_2({ subsets: ['latin', 'vietnamese'], variable: '--font-baloo' });
 * const sans = Be_Vietnam_Pro({ weight: ['400','500','600','700'], subsets: ['latin', 'vietnamese'], variable: '--font-be-vietnam' });
 * ...rồi thêm className={`${display.variable} ${sans.variable}`} vào <html>
 * và trỏ --font-display/--font-sans trong globals.css sang 2 biến trên.
 */

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
    <html lang={locale}>
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
