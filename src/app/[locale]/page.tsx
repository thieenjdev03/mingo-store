import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { MingoHomeView } from '@/sections/mingo-home/mingo-home-view';
import type { Locale } from '@/types/localized';
import { pageMetadata, SEO_COPY, toSeoLocale } from '@/lib/seo';

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({ locale: seoLocale, ...SEO_COPY[seoLocale].home });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MingoHomeView locale={locale as Locale} />;
}
