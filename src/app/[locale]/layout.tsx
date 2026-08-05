import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Work_Sans } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/features/cart/cart-context';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '@/styles/globals.css';

// Typography lấy trực tiếp từ Figma Mingo: Mikado cho headline và Work Sans
// cho body/navigation. Giữ tên CSS variable cũ để toàn bộ component hiện tại
// tự nhận font mới mà không ảnh hưởng root layout riêng của admin.
const mikado = localFont({
  src: [
    {
      path: '../../../public/Font/HVD Fonts - MikadoRegular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/Font/HVD Fonts - MikadoBold.otf',
      weight: '700 900',
      style: 'normal',
    },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang={locale} className={`storefront-theme ${mikado.variable} ${workSans.variable}`}>
      <body className="flex min-h-screen flex-col font-display">
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
