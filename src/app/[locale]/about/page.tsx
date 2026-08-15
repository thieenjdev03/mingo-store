import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AboutBrandView } from '@/sections/about/about-brand-view';
import { pageMetadata, SEO_COPY, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({ locale: seoLocale, pathname: '/about', ...SEO_COPY[seoLocale].about });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutBrandView />;
}
