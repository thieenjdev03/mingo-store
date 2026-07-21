import { setRequestLocale } from 'next-intl/server';
import { AboutBrandView } from '@/sections/about/about-brand-view';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutBrandView />;
}
