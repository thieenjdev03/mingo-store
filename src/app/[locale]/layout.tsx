import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/features/cart/cart-context';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '@/styles/globals.css';

// Font brand từ public/Font: Mikado cho display (trùng lettering logo),
// Mitr cho body (có glyph tiếng Việt đầy đủ — Mikado thiếu thì fallback per-glyph sang Mitr).
const mikado = localFont({
  src: [
    { path: '../../../public/Font/HVD Fonts - MikadoRegular.otf', weight: '400' },
    { path: '../../../public/Font/HVD Fonts - MikadoBold.otf', weight: '700' },
  ],
  variable: '--font-mikado',
  display: 'swap',
});

const mitr = localFont({
  src: [
    { path: '../../../public/Font/Mitr/Mitr-Regular.ttf', weight: '400' },
    { path: '../../../public/Font/Mitr/Mitr-Medium.ttf', weight: '500' },
    { path: '../../../public/Font/Mitr/Mitr-SemiBold.ttf', weight: '600' },
    { path: '../../../public/Font/Mitr/Mitr-Bold.ttf', weight: '700' },
  ],
  variable: '--font-mitr',
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
    <html lang={locale} className={`${mikado.variable} ${mitr.variable}`}>
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
